import simpleGit from 'simple-git';
import { exec } from 'child_process';

export const execBashScripts = (command, cb) => {
  const child = exec(command, (err, stdout, stderr) => {
    if (err !== null) return cb(new Error(err), null);
    else if (typeof stderr !== 'string') return cb(new Error(stderr), null);
    else return cb(null, stdout);
  });
};

//simple git helpers
export const checkIfBranchExists = async (input = '') => {
  const git = simpleGit();
  const { all } = await git.branch();

  const regexp = new RegExp(`^${input.toLowerCase()}$`, 'i');
  const isNewBranch = all.find(branch => branch.toLowerCase().match(regexp));

  if (input.length === 0) return 'Name is to short';

  return isNewBranch ? 'Branch already exists' : true;
};

//type = commit | branch
export const obligatoryWords = type => [
    `${
      type === 'Branches' ? 'feature' : 'feat'
    }: (${type}, that adds a new feature)`,
    `fix: (${type}, that fixes a bug)`,
    `refactor: (${type}, that rewrite/restructure your code, however does not change any behaviour )`,
    `perf: (${type} are special refactor commits, that improves performance)`,
    `style: (${type}, that do not affect the meaning (white-space, formatting, missing semi-colons, etc))`,
    `test: (${type}, that add missing tests or correcting existing tests)`,
    `docs: (${type}, that affect documentation only)`,
    `build: (${type}, that affect build components like build tool, ci pipeline, dependencies, project version)`,
    `ops: (${type}, that affect operational components like infrastructure, deployment, backup, recovery)`,
    `chore: (Miscellaneous ${type} e.g. modifying .gitignore)`,
  ];

//validators
export const validateSelect =  userInput =>
  userInput.length === 0 ? false : true;

export const validateInput = userInput =>
  userInput.length <= 1 ? false : true;

export const formatOnSpace = (type, value, splitOn = " ", specialCharacter = ":") =>
  `${type.split(splitOn)[0]}${specialCharacter}${value}`;
