import { getGlobalVariable } from '../../utils/env';
import { expectFileToExist, expectFileToMatch } from '../../utils/fs';
import { ng } from '../../utils/process';
import { expectToFail } from '../../utils/utils';

export default async function () {
  const usingWebpack = !getGlobalVariable('argv')['esbuild'];

  // Licenses should be left intact if extraction is disabled
  await ng('build', '--extract-licenses=false', '--output-hashing=none');

  if (usingWebpack) {
    await expectToFail(() => expectFileToExist('dist/test-project/browser/3rdpartylicenses.txt'));
  } else {
    // Application builder puts the licenses at the output path root
    await expectToFail(() => expectFileToExist('dist/test-project/3rdpartylicenses.txt'));
  }
  await expectFileToMatch('dist/test-project/browser/main.js', '@license');

  // Licenses should be removed if extraction is enabled
  await ng('build', '--extract-licenses', '--output-hashing=none');

  if (usingWebpack) {
    await expectFileToExist('dist/test-project/browser/3rdpartylicenses.txt');
  } else {
    await expectFileToExist('dist/test-project/3rdpartylicenses.txt');
  }
  await expectToFail(() => expectFileToMatch('dist/test-project/browser/main.js', '@license'));
}
