import assert from 'node:assert';
import { expectFileToExist, readFile, writeFile, replaceInFile } from '../../utils/fs';
import { ng } from '../../utils/process';
import { getGlobalVariable } from '../../utils/env';
import { updateJsonFile } from '../../utils/project';

const unexpectedStaticFieldErrorMessage =
  'Found unexpected static field. This indicates that the Safari <=v15 ' +
  'workaround for a scope variable tracking is not working. ' +
  'See: https://github.com/angular/angular-cli/pull/24357';

export default async function () {
  // Add a private method
  await replaceInFile(
    'src/app/app.component.ts',
    `title = 'test-project';`,
    `
      #myPrivateMethod() { return 1 }

      constructor() {
        console.log(this.#myPrivateMethod)
      }

      title = 'test-project';`,
  );

  await updateJsonFile('tsconfig.json', (tsconfig) => {
    tsconfig.compilerOptions.useDefineForClassFields = false;
  });

  // Matches two types of static fields that indicate that the Safari bug
  // may still occur. With the workaround this should not appear in bundles.
  //   - static { this.ecmp = bla }
  //   - static #_ = this.ecmp = bla
  const staticIndicatorRegex = /static\s+(\{|#[_\d]+\s+=)/;

  await writeFile('.browserslistrc', 'last 1 chrome version');
  await ng('build', '--configuration=development');
  await expectFileToExist('dist/test-project/browser/main.js');
  const mainContentChromeLatest = await readFile('dist/test-project/browser/main.js');

  assert.match(
    mainContentChromeLatest,
    staticIndicatorRegex,
    'Expected static fields to be used when Safari <=v15 is not targeted.',
  );
  assert.match(
    mainContentChromeLatest,
    /#myPrivateMethod/,
    'Expected private method to be used when Safari <=v15 is not targeted.',
  );

  await writeFile('.browserslistrc', 'Safari <=15');

  await ng('build', '--configuration=development');
  await expectFileToExist('dist/test-project/browser/main.js');
  const mainContentSafari15Explicit = await readFile('dist/test-project/browser/main.js');
  assert.doesNotMatch(
    mainContentSafari15Explicit,
    staticIndicatorRegex,
    unexpectedStaticFieldErrorMessage,
  );

  if (getGlobalVariable('argv')['esbuild']) {
    assert.match(
      mainContentSafari15Explicit,
      /var _myPrivateMethod/,
      'Expected private method to be downlevelled when Safari <=v15 is targeted',
    );
  } else {
    assert.match(
      mainContentSafari15Explicit,
      /_assertClassBrand/,
      'Expected private method to be downlevelled when Safari <=v15 is targeted',
    );
  }
}
