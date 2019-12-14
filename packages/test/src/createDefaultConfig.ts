import { isLernaPackage } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';
import { IArgs } from './types';

export default function(cwd: string, args: IArgs) {
  const types = ['spec', 'test'];
  if (args.e2e) {
    types.push('e2e');
  }

  const isLerna = isLernaPackage(cwd);
  const hasPackage = isLerna && args.package;
  const testMatchPrefix = hasPackage ? `**/packages/${args.package}/` : '';
  const hasSrc = existsSync(join(cwd, 'src'));

  return {
    verbose: true,
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    moduleNameMapper: {
      '\\.(css|less|sass|scss)$': require.resolve('identity-obj-proxy'),
      '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': require.resolve(
        '../helpers/mock/file',
      ),
    },
    setupFiles: [require.resolve('../helpers/setupFiles/shim')],
    setupFilesAfterEnv: [require.resolve('../helpers/setupFiles/jasmine')],
    testMatch: [`${testMatchPrefix}**/?*.(${types.join('|')}).(j|t)s?(x)`],
    testPathIgnorePatterns: ['/node_modules/'],
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': require.resolve(
        '../helpers/transformers/javascript',
      ),
      '\\.svg$': require.resolve('../helpers/transformers/file'),
    },
    collectCoverageFrom: [
      'index.{js,jsx,ts,tsx}',
      hasSrc && 'src/**/*.{js,jsx,ts,tsx}',
      isLerna && !args.package && 'packages/*/src/*.{js,jsx,ts,tsx}',
      isLerna &&
        args.package &&
        `packages/${args.package}/src/**/*.{js,jsx,ts,tsx}`,
      '!**/typings/**',
      '!**/types/**',
      '!**/fixtures/**',
      '!**/examples/**',
      '!**/*.d.ts',
    ].filter(Boolean),
    // transformIgnorePatterns: [
    //   // 加 [^/]*? 是为了兼容 tnpm 的目录结构
    //   // 比如：_umi-test@1.5.5@umi-test
    //   `node_modules/(?!([^/]*?umi|[^/]*?umi-test)/)`,
    // ],
  };
}