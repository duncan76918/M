/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { Rule } from '@angular-devkit/schematics';
import { generateFromFiles } from '../utility/generate-from-files';
import { Schema } from './schema';

export default function (options: Schema): Rule {
  return options.functional
    ? generateFromFiles({ ...options, templateFilesDirectory: './functional-files' })
    : generateFromFiles({ ...options, templateFilesDirectory: './class-files' });
}
