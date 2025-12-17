import fetch from "node-fetch";

export async function runOperationHTTP(params: {
  url: string;
  operation: string;
  variables?: Record<string, any>;
  headers?: Record<string, string>;
}) {
  const res = await fetch(params.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(params.headers || {}),
    },
    body: JSON.stringify({
      query: params.operation,
      variables: params.variables || {},
    }),
  });

  return res.json();
}
