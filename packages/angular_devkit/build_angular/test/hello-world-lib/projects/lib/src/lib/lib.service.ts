/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { Injectable } from '@angular/core';

@Injectable()
export class LibService {

  testEs2016() {
    return ['foo', 'bar'].includes('foo');
  }

}
