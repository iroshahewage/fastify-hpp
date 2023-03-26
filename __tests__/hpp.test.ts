import fastify, { FastifyInstance } from 'fastify';
import hppPlugin from '../src';

describe('hppPlugin', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = fastify();
  });

  afterEach(() => {
    app.close();
  });

  it('should not modify query parameters if options.checkQuery is false', async () => {
    app.register(hppPlugin, { checkQuery: false });

    app.get('/', (req, res) => {
      res.send(req.query);
    });

    const response = await app.inject({
      method: 'GET',
      url: '/?foo=1&foo=2&bar=3',
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(
      JSON.stringify({ foo: ['1', '2'], bar: '3' })
    );
  });

  it('should modify query parameters if they contain repeated values', async () => {
    app.register(hppPlugin);

    app.get('/', (req, res) => {
      res.send(req.query);
    });

    const response = await app.inject({
      method: 'GET',
      url: '/?foo=1&foo=2&bar=3&bar=4&baz=5',
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(
      JSON.stringify({ foo: '2', bar: '4', baz: '5' })
    );
  });

  it('should allow whitelisting certain query parameters', async () => {
    app.register(hppPlugin, { whitelist: ['foo'] });

    app.get('/', (req, res) => {
      res.send(req.query);
    });

    const response = await app.inject({
      method: 'GET',
      url: '/?foo=1&foo=2&bar=3',
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(
      JSON.stringify({ foo: ['1', '2'], bar: '3' })
    );
  });

   it('should remove polluted query parameters and store them in queryPolluted', async () => {
     app.get('/', (req, res) => {
       expect(req.queryPolluted).toEqual({ a: ['1', '2'] });
       expect(req.query).toEqual({ a: '2' });
       res.send();
     });
     await app.inject({
       method: 'GET',
       url: '/?a=1&a=2',
     });
   });
});
