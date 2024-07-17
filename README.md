[![npm version](https://badge.fury.io/js/elite-fetch.svg)](https://badge.fury.io/js/elite-fetch)

# Elite Fetch

> An elite HTTP client tool for making and handling requests. You can easily config your request globally or just for the instance you're using.

## Table of contents

- [Elite Fetch](#elite-fetch)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Using `async/await`](#using-asyncawait)
    - [Using Promises](#using-promises)
  - [Global Configuration](#global-configuration)
  - [Per-Instance Configuration](#per-instance-configuration)
    - [Using Chaining](#using-chaining)
    - [Using Parameters](#using-parameters)
  - [API](#api)
    - [get](#geturl-params-props)
    - [post](#posturl-data-props)
    - [put](#puturl-data-props)
    - [delete](#deleteurl-data-props)
    - [locale](#localelocale)
    - [authToken](#authtokentoken)
    - [includeCredentials](#includecredentials-1)
    - [excludeCredentials](#excludecredentials)
    - [header](#headerkey)
    - [removeHeader](#removeheaderkey)
    - [baseUrl](#baseurlbaseurl)
    - [timeout](#timeouttimeout)
  - [Types](#types)
  - [Thank You](#thank-you)

## Getting Started

It's so easy to work with elite fetch. Just install it as following, then make a request using `get`, `post`, `put` and `delete` methods. If there's any configuration needed for your request, you can either pass it to these methods as an object, or just use the utility functions to set up you request.

## Installation

To install the library, run:

```sh
$ npm i elite-fetch
```

Or:

```sh
$ yarn add elite-fetch
```

## Usage

### Using `async/await`

```javascript
import { http } from "elite-fetch";

const users = await http.get("https://example.com/api/users");
```

### Using Promises

```javascript
import { http } from "elite-fetch";

http.get("https://example.com/api/users").then((users) => {
  // Use received data
});
```

## Global Configuration

You can change the default settings of your request all across the application. Here you can see all available configs you can set globally with their default values.

### `baseUrl`

Base url of all http requests.

| Type   | Default value |
| ------ | ------------- |
| string | ""            |

#### Example

```js
http.global.baseUrl = "https://example.com";
```

### `authToken`

Authorization header for all http requests.

| Type   | Default value |
| ------ | ------------- |
| string | `undefined`   |

#### Example

```js
http.global.authToken = "Bearer TOKEN_VALUE";
```

### `headers`

Request headers of all http requests.

| Type        | Default value                            |
| ----------- | ---------------------------------------- |
| HeadersInit | `{ "Content-Type": "application/json" }` |

#### Example

```js
http.global.headers = { "Custom-Header": "test value" };
```

### `includeCredentials`

Including credentials and http-cookies in all http requests.

| Type    | Default value |
| ------- | ------------- |
| Boolean | false         |

#### Example

```js
http.global.includeCredentials = true;
```

### `locale`

Accept-language header of all http requests.

| Type   | Default value         |
| ------ | --------------------- |
| string | default browser value |

#### Example

```js
http.global.locale = "fr-FR";
```

### `timeout`

Request timeout of all http requests.

| Type   | Default value |
| ------ | ------------- |
| number | 5000          |

#### Example

```js
http.global.timeout = 10000;
```

### `onError`

The error callback that would get called if any request catches an error.

| Type          | Default value |
| ------------- | ------------- |
| ErrorCallback | `undefined`   |

#### Example

```js
http.global.onError = (error) => {
  console.log(error.statusCode, error.message);
};
```

### `onRequest`

The callback that would get called before all requests. You can access and change request initialization in this callback.

| Type            | Default value |
| --------------- | ------------- |
| RequestCallback | `undefined`   |

#### Example

```js
http.global.onRequest = (init) => {
  var myController = new AbortController();
  init.signal = myController.signal;
};
```

### `onRespond`

The callback that would get called after request each successfully responded. You can access and change request result in this callback.

| Type            | Default value |
| --------------- | ------------- |
| RespondCallback | `undefined`   |

> [!NOTE]
> If you're setting this callback globally, please consider to return the result, so you can access it in the next promise chain.

#### Example

```js
http.global.onRespond = (result) => {
  console.log(result);

  // Most return. otherwise result would be undefined in the next chain
  return result;
};

http.get("https://example.com/api/users").then((users) => {
  // you can access users now
});
```

## Per-Instance Configuration

You can also change request configuration for each `http` instance. These configurations **will override global configuration**.

### Using Chaining

```javascript
import { http } from "elite-fetch";

const users = await http
  .header("Custom-Header", "test value");
  .timeout(2000)
  .post("https://example.com/api/users", {
    name: "John Doe",
    age: 36,
  });
```

### Using Parameters

```javascript
import { http } from "elite-fetch";

const users = await http.post(
  "https://example.com/api/users",
  {
    name: "John Doe",
    age: 36,
  },
  {
    headers: { "Custom-Header": "test value" },
    timeout: 2000,
  }
);
```

## API

### `.get(url, params?, props?)`

makes a GET method request

#### Options

| Properties | Description                                  | Type          | Default value |
| ---------- | -------------------------------------------- | ------------- | ------------- |
| url        | Request url                                  | string        | ""            |
| params     | Parameters to be added to url as querystring | UrlParameters | `undefined`   |
| props      | Request configurations                       | RequestProps  | `undefined`   |

### `.post(url, data?, props?)`

makes a POST method request

#### Options

| Properties | Description            | Type         | Default value |
| ---------- | ---------------------- | ------------ | ------------- |
| url        | Request url            | string       | ""            |
| data       | the data to be posted  | object       | `undefined`   |
| props      | Request configurations | RequestProps | `undefined`   |

### `.put(url, data?, props?)`

makes a PUT method request

#### Options

| Properties | Description                             | Type         | Default value |
| ---------- | --------------------------------------- | ------------ | ------------- |
| url        | Request url                             | string       | ""            |
| data       | the data to be parsed into request body | object       | `undefined`   |
| props      | Request configurations                  | RequestProps | `undefined`   |

### `.delete(url, data?, props?)`

makes a Delete method request

#### Options

| Properties | Description                             | Type         | Default value |
| ---------- | --------------------------------------- | ------------ | ------------- |
| url        | Request url                             | string       | ""            |
| data       | the data to be parsed into request body | object       | `undefined`   |
| props      | Request configurations                  | RequestProps | `undefined`   |

### `.locale(locale)`

Sets the "Accept-Language" header of the request.

#### Options

| Properties | Description    | Type   | Default value |
| ---------- | -------------- | ------ | ------------- |
| locale     | Desired locale | string | ""            |

#### Example

```js
http.locale("fr-FR");
```

> [!NOTE]
> This method sets the locale for **all following requests** by the current `http` instance.

> [!IMPORTANT]
> If you've set locale globally, this method **will override** the value.

### `.authToken(token)`

Sets the "Authorization" header of the request.

#### Options

| Properties | Description | Type   | Default value |
| ---------- | ----------- | ------ | ------------- |
| token      | Token value | string | ""            |

#### Example

```js
http.authToken("Bearer TOKEN_VALUE");
```

> [!NOTE]
> This method sets the token for **all following requests** by the current `http` instance.

> [!IMPORTANT]
> If you've set auth globally, this method **will override** the value.

### `.includeCredentials()`

Includes credentials and http-cookies in the request.

#### Options

This method has no parameters

#### Example

```js
http.includeCredentials();
```

> [!NOTE]
> This method includes credentials for **all following requests** by the current `http` instance.

> [!IMPORTANT]
> If you've excluded credentials globally, this method **will override** the value.

### `.excludeCredentials()`

Excludes credentials and http-cookies from the request.

#### Options

This method has no parameters

#### Example

```js
http.excludeCredentials();
```

> [!NOTE]
> This method excludes credentials from **all following requests** by the current `http` instance.

> [!IMPORTANT]
> If you've set credentials globally, this method **will override** the value.

### .header(key)

Returns the value of a spicific request header item.

#### Options

| Properties | Description | Type   | Default value |
| ---------- | ----------- | ------ | ------------- |
| key        | Header key  | string | ""            |

#### Example

```js
var contentType = http.header("Content-Type");
```

### .header(key, value)

Adds/Modifies a request header.

#### Options

| Properties | Description  | Type   | Default value |
| ---------- | ------------ | ------ | ------------- |
| key        | Header key   | string | ""            |
| value      | Header value | string | ""            |

#### Example

```js
http.header("Content-Type", "application/x-www-form-urlencoded");
```

> [!NOTE]
> This method adds/modifies a specific header for **all following requests** by the current `http` instance.

> [!IMPORTANT]
> If you've set a header globally with the same key, this method **will override** the value.

### .removeHeader(key)

Removes a request header from the request.

#### Options

| Properties | Description | Type   | Default value |
| ---------- | ----------- | ------ | ------------- |
| key        | Header key  | string | ""            |

#### Example

```js
http.removeHeader("Authorization");
```

> [!NOTE]
> This method removes the header for **all following requests** by the current `http` instance.

### .baseUrl(baseUrl)

Sets the base url for the http instance.

#### Options

| Properties | Description | Type   | Default value |
| ---------- | ----------- | ------ | ------------- |
| baseUrl    | Base URL    | string | ""            |

#### Example

```js
http.baseUrl("http://example.com/");
```

> [!NOTE]
> This method sets the base url for **all following requests** by the current `http` instance.

> [!IMPORTANT]
> If you've set base url globally, this method **will override** the value.

### .timeout(timeout)

Sets the timeout for the current http instance

#### Options

| Properties | Description     | Type   | Default value |
| ---------- | --------------- | ------ | ------------- |
| timeout    | Request timeout | number | 5000          |

#### Example

```js
http.timeout(10000);
```

> [!NOTE]
> This method sets the timeout for **all following requests** by the current `http` instance.

> [!IMPORTANT]
> If you've set timeout globally, this method **will override** the value.

## Types

### `RequestProps`

The interface for configurating requests.

```ts
interface RequestProps {
  locale?: string;
  authToken?: string;
  headers?: HeadersInit;
  includeCredentials?: boolean;
  baseUrl?: string;
  timeout?: number;
}
```

### `UrlParameters`

It's an object that all its properties have a `string` or `number` value.

```ts
type UrlParameters = Record<string, string | number>;
```

### `ErrorCallback`

The interface for `onError` callback.

```ts
type ErrorCallback = (error: FetchError) => void;
```

### `FetchError`

The interface for http request errors.

```ts
type FetchError = {
  statusCode: number;
  message: string;
};
```

### `RequestCallback`

The interface for `onRequest` callback.

```ts
type RequestCallback = (config: RequestInit) => void | Promise<void>;
```

### `RespondCallback`

The interface for `onRespond` callback

```ts
type RespondCallback = <TResult>(result: TResult) => TResult | Promise<TResult>;
```

## Thank You

Thank you for using this tool. Please let me know if there's any problem with it or anyway I can improve it.
