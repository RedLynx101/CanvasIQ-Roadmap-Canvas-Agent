"use client";
import { useEffect, useRef, useState } from "react";
import { Project } from "../domain/schema";
import { Answer, answerSchema, applyProposal } from "../domain/assistant";
import { readEvents } from "../domain/stream";
import { currentProject, updateProject } from "../store/workspace";
import { currency } from "../domain/export";
import { Button, Dialog, Field } from "./shared";
type Message = { role: "user" | "assistant"; content: string };
export function Assistant({
  project: p,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [prompt, setPrompt] = useState(""),
    [consent, setConsent] = useState(false),
    [access, setAccess] = useState(""),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [answer, setAnswer] = useState<Answer | null>(null),
    [history, setHistory] = useState<Message[]>(p.conversation);
  const abort = useRef<AbortController | null>(null),
    baseline = useRef("");
  useEffect(() => () => abort.current?.abort(), []);
  async function send() {
    abort.current = new AbortController();
    setBusy(true);
    setStatus("Connecting…");
    setAnswer(null);
    baseline.current = JSON.stringify({
      ...currentProject(),
      conversation: [],
    });
    const question = prompt;
    let completed = false;
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-canvasiq-access": access,
        },
        body: JSON.stringify({
          prompt: question,
          project: { ...currentProject(), snapshots: [] },
          consent,
          history: history.slice(-6),
        }),
        signal: abort.current.signal,
      });
      if (!response.ok)
        throw new Error((await response.json()).error || "Request failed.");
      if (!response.body) throw new Error("No response received.");
      for await (const event of readEvents(response.body)) {
        if (event.type === "status") setStatus(event.message);
        else if (event.type === "error") throw new Error(event.message);
        else if (event.type === "result") {
          const result = answerSchema.parse(event.data);
          setAnswer(result);
          const next = [
            ...history,
            { role: "user", content: question },
            { role: "assistant", content: result.answer },
          ].slice(-20) as Message[];
          setHistory(next);
          if (currentProject().id === p.id)
            updateProject((project) => {
              project.conversation = next;
            });
          setPrompt("");
          setStatus("Review the response before making changes.");
          completed = true;
        }
      }
      if (!completed)
        throw new Error(
          "The response was interrupted. Your project is unchanged.",
        );
    } catch (e) {
      setStatus(
        (e as Error).name === "AbortError"
          ? "Request cancelled. Your project is unchanged."
          : (e as Error).message,
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title="Ask CanvasIQ"
      onClose={() => {
        abort.current?.abort();
        onClose();
      }}
    >
      <div className="assistant-intro">
        <span className="tag">OPTIONAL AI ASSISTANCE</span>
        <p>
          Ask about tradeoffs, missing assumptions, or a new initiative.
          Calculations use your planning model. Proposed changes wait for your
          review.
        </p>
        <p>
          Your request, current planning data and recent messages are sent to
          OpenAI only when you send. Use non-sensitive information. This
          deployment requires an access code from its operator.
        </p>
      </div>
      <Field label="Deployment access code">
        <input
          type="password"
          autoComplete="off"
          value={access}
          onChange={(e) => setAccess(e.target.value)}
        />
      </Field>
      <label className="check-row">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        I agree to send this planning context to OpenAI.
      </label>
      {history.map((m, index) => (
        <div className="assistant-message" key={index}>
          <span className="eyebrow">
            {m.role === "user" ? "YOU" : "CANVASIQ"}
          </span>
          {m.content}
        </div>
      ))}
      {answer?.questions.length ? (
        <div className="explanation">
          <h3>Worth clarifying</h3>
          <ul>
            {answer.questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {answer?.proposal && (
        <div className="assistant-proposal">
          <span className="eyebrow">PROPOSED CHANGE · NOT YET APPLIED</span>
          <h3>{answer.proposal.initiative.name}</h3>
          <p>{answer.proposal.initiative.problem}</p>
          <p>
            Implementation:{" "}
            {currency(answer.proposal.initiative.implementationCost)}
            <br />
            Annual operating: {currency(answer.proposal.initiative.annualCost)}
            <br />
            Annual benefit: {currency(answer.proposal.initiative.annualBenefit)}
          </p>
          <details>
            <summary>Review every proposed field</summary>
            <pre>{JSON.stringify(answer.proposal, null, 2)}</pre>
          </details>
          <div className="assistant-actions">
            <Button
              onClick={() => {
                try {
                  if (
                    JSON.stringify({
                      ...currentProject(),
                      conversation: [],
                    }) !== baseline.current
                  )
                    throw new Error(
                      "The project changed since this response. Ask again before applying.",
                    );
                  const updated = applyProposal(
                    currentProject(),
                    answer.proposal!,
                  );
                  updateProject((p) => Object.assign(p, updated));
                  setAnswer({ ...answer, proposal: null });
                  setStatus(
                    "Draft applied. AI estimates are marked unverified in the evidence ledger.",
                  );
                } catch (e) {
                  setStatus((e as Error).message);
                }
              }}
            >
              Apply draft
            </Button>
            <Button
              variant="ghost"
              onClick={() => setAnswer({ ...answer, proposal: null })}
            >
              Discard
            </Button>
          </div>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <Field label="Your question">
          <textarea
            required
            maxLength={2000}
            rows={4}
            placeholder="What assumptions most affect this portfolio?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </Field>
        <div className="assistant-actions">
          <Button
            type="submit"
            disabled={busy || !consent || !access || !prompt.trim()}
          >
            {busy ? "Working…" : "Send question"}
          </Button>
          {busy && (
            <Button variant="secondary" onClick={() => abort.current?.abort()}>
              Cancel
            </Button>
          )}
        </div>
        <p className="assistant-message" role="status">
          {status}
        </p>
      </form>
    </Dialog>
  );
}
