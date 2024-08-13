/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { executeDevServer } from '../../index';
import { executeOnceAndFetch } from '../execute-fetch';
import { describeServeBuilder } from '../jasmine-helpers';
import { BASE_OPTIONS, DEV_SERVER_BUILDER_INFO } from '../setup';

const FETCH_HEADERS = Object.freeze({ host: 'example.com' });

describeServeBuilder(
  executeDevServer,
  DEV_SERVER_BUILDER_INFO,
  (harness, setupTarget, isViteRun) => {
    // This option is not used when using vite.
    (isViteRun ? xdescribe : xdescribe)('option: "disableHostCheck"', () => {
      beforeEach(async () => {
        setupTarget(harness);

        // Application code is not needed for these tests
        await harness.writeFile('src/main.ts', '');
      });

      it('does not allow an invalid host when option is not present', async () => {
        harness.useTarget('serve', {
          ...BASE_OPTIONS,
        });

        const { result, response } = await executeOnceAndFetch(harness, '/', {
          request: { headers: FETCH_HEADERS },
        });

        expect(result?.success).toBeTrue();
        expect(await response?.text()).toBe('Invalid Host header');
      });

      it('does not allow an invalid host when option is false', async () => {
        harness.useTarget('serve', {
          ...BASE_OPTIONS,
          disableHostCheck: false,
        });

        const { result, response } = await executeOnceAndFetch(harness, '/', {
          request: { headers: FETCH_HEADERS },
        });

        expect(result?.success).toBeTrue();
        expect(await response?.text()).toBe('Invalid Host header');
      });

      it('allows a host when option is true', async () => {
        harness.useTarget('serve', {
          ...BASE_OPTIONS,
          disableHostCheck: true,
        });

        const { result, response } = await executeOnceAndFetch(harness, '/', {
          request: { headers: FETCH_HEADERS },
        });

        expect(result?.success).toBeTrue();
        expect(await response?.text()).toContain('<title>');
      });
    });
  },
);
