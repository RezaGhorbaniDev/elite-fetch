import Fetch from "../http/fetch";

export const user = {
  fullName: "Reza Ghorbani",
  age: 28,
};

export const users = [
  {
    fullName: "John Doe",
    age: 16,
  },
  {
    fullName: "Sarah Connor",
    age: 36,
  },
  {
    fullName: "John Lennon",
    age: 40,
  },
];

//======================= Mock fetch response

const mockFetchResponse = (response: Partial<Response>) => {
  // Mock the response
  // global.fetch = jest.fn(() => Promise.resolve(response as Response));
  global.fetch = jest.fn(() => Promise.resolve(response as Response));
};

export const mockFetchLongResponse = async (milliseconds: number) => {
  // Mock the response
  global.fetch = jest.fn(async () => {
    // delay the response
    await new Promise((resolve) => setTimeout(resolve, milliseconds));

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(users),
    } as Response);
  });
};

export const mockGetUsers = () => {
  mockFetchResponse({
    ok: true,
    json: () => Promise.resolve(users),
  });
};

export const mockCreateUser = () => {
  mockFetchResponse({
    ok: true,
    json: () => Promise.resolve({ ...user, id: 3 }),
  });
};

export const resetMocks = () => {
  jest.clearAllMocks();
  Fetch.global = {
    timeout: 5000,
  };
};
