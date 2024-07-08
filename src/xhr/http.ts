import { FetchError, NotImplementedError } from "src/lib/errors";
import Fetch from "./fetch";

function handleError({ statusCode, message }: FetchError) {
  if (statusCode === 401) {
    throw new NotImplementedError();
  } else if (statusCode >= 400 && statusCode < 500) console.log(message);
}

export default new Fetch({
  onError: handleError,
});
