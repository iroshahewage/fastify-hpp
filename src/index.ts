import fp from 'fastify-plugin';
import type { FastifyPluginCallback } from 'fastify';

// Augmenting the FastifyRequest interface to include a new property for storing polluted query parameters
declare module 'fastify' {
  interface FastifyRequest {
    queryPolluted: Record<string, unknown> | undefined;
  }
}

// Defining the options interface for the hppPlugin
export interface HppOptions {
  checkQuery?: boolean;
  whitelist?: null | string | string[];
}

// Default options for the hppPlugin
const DEFAULT_OPTIONS: HppOptions = {
  checkQuery: true,
  whitelist: null,
};

const hppPlugin: FastifyPluginCallback<HppOptions> = (
  fastify,
  options: HppOptions = {},
  done: () => void
) => {
  // Merging the default options with the provided options
  options = { ...DEFAULT_OPTIONS, ...options };

  // Converting a single string to an array of strings for the whitelist property
  if (typeof options.whitelist === 'string') {
    options.whitelist = [options.whitelist];
  }

  // Deactivating the whitelist property if it is not a string or an array of strings
  if (options.whitelist !== null && !Array.isArray(options.whitelist)) {
    console.error(
      '[HPP] ' +
        'The "options.whitelist" parameter must be either a string or an array. ' +
        'The whitelist has been deactivated!'
    );
    options.whitelist = null;
  }

  // Filtering out non-string values from the whitelist array
  if (options.whitelist) {
    options.whitelist = options.whitelist.filter(
      (param) => typeof param === 'string'
    );
  }

  // Decorating the FastifyRequest interface with a new property for storing polluted query parameters
  fastify.decorateRequest('queryPolluted', undefined);

  fastify.addHook('onRequest', function (req, reply, done) {
    if (options.checkQuery && req.query) {
      const whitelist = options.whitelist;
      const query = req.query as Record<string, unknown> | undefined;
      let queryPolluted = req.queryPolluted as
        | Record<string, unknown>
        | undefined;

      if (typeof query === 'object' && query !== null) {
        if (queryPolluted === undefined) {
          queryPolluted = req.queryPolluted = {};

          const parameters = Object.keys(query || {});

          const parametersLength = parameters.length;

          for (let i = 0; i < parametersLength; i++) {
            const paramKey = parameters[i];
            const paramValue = query[paramKey];

            if (!Array.isArray(paramValue)) {
              continue;
            }

            queryPolluted[paramKey] = paramValue;
            query[paramKey] = paramValue[paramValue.length - 1];
          }
        }
      }

      if (Array.isArray(whitelist)) {
        const whitelistLength = whitelist.length;

        for (let i = 0; i < whitelistLength; i++) {
          const whitelistedParam = whitelist[i];

          if (queryPolluted && query && queryPolluted[whitelistedParam]) {
            query[whitelistedParam] = queryPolluted[whitelistedParam];
            delete queryPolluted[whitelistedParam];
          }
        }
      }
    }

    done();
  });

  done();
};

export default fp(hppPlugin);
