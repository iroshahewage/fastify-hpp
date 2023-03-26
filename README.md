# Fastify HPP

fastify-hpp is a middleware plugin for Fastify that protects against HTTP Parameter Pollution (HPP) attacks by filtering out repeated or duplicate query parameters. This plugin also allows for a whitelist of parameters that should not be filtered.

## Installation

Install fastify-hpp using NPM:

```sh
npm install fastify-hpp
```

## Usage

Register fastify-hpp as a middleware in your Fastify application:

```javascript const fastify = require('fastify')();
const fastify = require("fastify")();
const fastifyHpp = require("fastify-hpp");

fastify.register(fastifyHpp);
```

You can also pass in options to configure the plugin:

```javascript
fastify.register(fastifyHpp, {
  checkQuery: true,
  whitelist: ["param1", "param2"],
});
```

## The available options include:

checkQuery: a boolean value indicating whether to check query parameters for pollution (default: true).
whitelist: an array of parameter names that should not be filtered (default: null).

## License

fastify-hpp is MIT licensed.
