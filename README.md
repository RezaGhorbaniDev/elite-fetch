[![npm version](https://badge.fury.io/js/elite-fetch.svg)](https://badge.fury.io/js/elite-fetch)

# Elite Fetch

> Write a project description

## Table of contents

- [Elite Fetch](#elite-fetch)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
    - [get](#get)
    - [post](#post)
    - [put](#put)
    - [delete](#delete)
  - [Contributing](#contributing)
  - [Credits](#credits)
  - [Built With](#built-with)
  - [Versioning](#versioning)
  - [Authors](#authors)
  - [License](#license)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

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

## Configuration

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

| Properties | Description                                  | Type                   | Default value |
| ---------- | -------------------------------------------- | ---------------------- | ------------- |
| url        | Request url                                  | string                 | ""            |
| params     | Parameters to be added to url as querystring | Record<string, string> | `undefined`   |
| props      | Request configurations                       | RequestProps           | `undefined`   |

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

Returns the value. of a spicific request header item.

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

## Thank You

Thank you for using this tool. Please let me know if there's any problem with it or anyway I can improve it.
