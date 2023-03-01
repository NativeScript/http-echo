import { unstable_dev } from 'wrangler';
import type { UnstableDevWorker } from 'wrangler';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';

describe('Worker', () => {
	let worker: UnstableDevWorker;

	beforeAll(async () => {
		worker = await unstable_dev('src/index.ts', {
			experimental: { disableExperimentalWarning: true },
		});
	});

	afterAll(async () => {
		await worker.stop();
	});

	it('should echo and return 200 response', async () => {
		const resp = await worker.fetch('/get?foo=bar', {
			method: 'GET',
		});
		expect(resp.status).toBe(200);

		const json: any = await resp.json();

		expect(json).toHaveProperty('headers');
		expect(json).toHaveProperty('url');
		expect(json.args).toEqual({
			foo: 'bar',
		});
		expect(json.method).toBe('GET');
	});

	it('should echo request formData', async () => {
		const formData = new FormData();
		formData.set('foo', 'bar');

		const resp = await worker.fetch('/post', {
			method: 'POST',
			body: formData as any,
		});
		expect(resp.status).toBe(200);

		const json: any = await resp.json();
		expect(json.form).toEqual({
			foo: 'bar',
		});
	});

	it('should return html', async () => {
		const resp = await worker.fetch('/html');
		expect(resp.status).toBe(200);
		expect(resp.headers.get('content-type')).toBe('text/html');

		const text = await resp.text();
		expect(text).toBe(`<html><body><h1>Hello World</h1></body></html>`);
	});

	it('should return png', async () => {
		const resp = await worker.fetch('/image/png');
		expect(resp.status).toBe(200);
		expect(resp.headers.get('content-type')).toBe('image/png');
		expect(resp.headers.get('content-length')).toBe('1553');

		const data = await resp.arrayBuffer();
		expect(data.byteLength).toBe(1553);
	});

	it('should return jpeg', async () => {
		const resp = await worker.fetch('/image/jpeg');
		expect(resp.status).toBe(200);
		expect(resp.headers.get('content-type')).toBe('image/jpeg');
		expect(resp.headers.get('content-length')).toBe('7911');

		const data = await resp.arrayBuffer();
		expect(data.byteLength).toBe(7911);
	});

	it('should return json', async () => {
		const resp = await worker.fetch('/json');
		expect(resp.status).toBe(200);

		const json = await resp.json();
		expect(json).toEqual({});
	});

	it('should return jsonp', async () => {
		const resp = await worker.fetch('/jsonp');
		expect(resp.status).toBe(200);

		const json = await resp.json();
		expect(json).toEqual({});
	});


	it('should return gzip', async () => {
		const resp = await worker.fetch('/gzip');
		expect(resp.status).toBe(200);
		expect(resp.headers.get('content-encoding')).toBe('gzip');

		const json = await resp.json();
		expect(json).toBeDefined()
	});
});
