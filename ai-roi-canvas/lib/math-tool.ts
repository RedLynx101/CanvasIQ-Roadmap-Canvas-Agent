// Math tool utilities for agent tool-calls

const ALLOWED_FUNCTIONS = [
  'abs',
  'ceil',
  'floor',
  'round',
  'sqrt',
  'log',
  'ln',
  'exp',
  'pow',
  'max',
  'min',
  'sin',
  'cos',
  'tan',
];

const ALLOWED_CONSTANTS = ['pi', 'e'];

// Tool definition provided to OpenAI
export const mathToolDefinition = {
  type: 'function' as const,
  function: {
    name: 'evaluate_math',
    description:
      'Safely evaluate a mathematical expression when you need exact arithmetic or ROI-related calculations.',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description:
            'The mathematical expression to evaluate. Supports +, -, *, /, %, ^ (exponent), parentheses, and functions: abs, ceil, floor, round, sqrt, log/ln, exp, pow, max, min, sin, cos, tan. Constants: pi, e.',
        },
      },
      required: ['expression'],
    },
  },
};

function validateExpression(expression: string): string {
  if (typeof expression !== 'string') {
    throw new Error('Expression must be a string.');
  }

  const trimmed = expression.trim();
  if (!trimmed) {
    throw new Error('Expression cannot be empty.');
  }

  if (trimmed.length > 200) {
    throw new Error('Expression is too long. Keep it concise.');
  }

  // Only allow numbers, operators, whitespace, dots, commas, parentheses, and letters
  const invalidCharacters = trimmed.match(/[^0-9+\-*/%^().,\sA-Za-z]/);
  if (invalidCharacters) {
    throw new Error('Unsupported characters detected in expression.');
  }

  // Ensure only allowed function/constant names are used
  const tokens = trimmed.match(/[A-Za-z]+/g) || [];
  const unknownTokens = tokens.filter((token) => {
    const lower = token.toLowerCase();
    return (
      !ALLOWED_FUNCTIONS.includes(lower) &&
      !ALLOWED_CONSTANTS.includes(lower)
    );
  });

  if (unknownTokens.length > 0) {
    const unique = Array.from(new Set(unknownTokens.map((t) => t.toLowerCase())));
    throw new Error(
      `Unsupported functions/constants: ${unique.join(', ')}.`
    );
  }

  return trimmed;
}

export function evaluateMathExpression(expression: string) {
  const validated = validateExpression(expression);
  const normalized = validated.replace(/\^/g, '**');

  // Build a safe evaluator with only Math functions/constants exposed
  const evaluator = Function(
    '"use strict";\n' +
      'const { abs, ceil, floor, round, sqrt, log, exp, pow, max, min, sin, cos, tan, PI, E } = Math;\n' +
      'const ln = log;\n' +
      'const pi = PI;\n' +
      'const e = E;\n' +
      `return (${normalized});`
  );

  const rawResult = evaluator();

  if (typeof rawResult !== 'number' || !Number.isFinite(rawResult)) {
    throw new Error('Expression did not evaluate to a finite number.');
  }

  // Keep a reasonable precision for display
  const result = Math.round(rawResult * 1e10) / 1e10;

  return {
    expression: validated,
    result,
  };
}


