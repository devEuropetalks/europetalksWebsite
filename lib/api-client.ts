/**
 * API client utilities for making fetch requests
 */

/**
 * Custom error type for API requests
 */
export interface ApiError extends Error {
  info?: unknown;
  status?: number;
}

/**
 * Default fetcher function for SWR
 * @param url The URL to fetch
 * @returns The JSON response
 */
export const fetcher = async <T = unknown>(url: string): Promise<T> => {
  const res = await fetch(url);

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the data."
    ) as ApiError;
    // Attach extra info to the error object.
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

/**
 * POST request helper
 * @param url The URL to fetch
 * @param data The data to send
 * @returns The JSON response
 */
export const postData = async <T>(url: string, data: unknown): Promise<T> => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = new Error(
      "An error occurred while posting the data."
    ) as ApiError;
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

/**
 * PUT request helper
 * @param url The URL to fetch
 * @param data The data to send
 * @returns The JSON response
 */
export const putData = async <T>(url: string, data: unknown): Promise<T> => {
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = new Error(
      "An error occurred while updating the data."
    ) as ApiError;
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

/**
 * DELETE request helper
 * @param url The URL to fetch
 * @returns The JSON response
 */
export const deleteData = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = new Error(
      "An error occurred while deleting the data."
    ) as ApiError;
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};
