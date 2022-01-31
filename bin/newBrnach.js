import inquirer from 'inquirer';
import simpleGit from 'simple-git';
import {
  checkIfBranchExists,
  formatOnSpace,
  obligatoryWords,
  validateSelect,
} from './helpers.js';

export const newBranchFromMain = async () => {
  const git = simpleGit();
  const branchTypeNames = obligatoryWords('Branches');
//   await git.stash();
  const { branchType, newBranch } = await inquirer.prompt([
    {
      type: 'list',
      name: 'branchType',
      message: 'Choose branch type:',
      choices: branchTypeNames,
      default: branchTypeNames[0],
      validate: validateSelect,
    },
    {
      type: 'input',
      name: 'newBranch',
      message: 'Branch name:',
      validate: checkIfBranchExists,
    },
  ]);

  const formattedBranch = formatOnSpace(branchType, newBranch, ":" , "/");

  await git.checkoutBranch(formattedBranch, 'origin/main');
  await git.push('origin', formattedBranch, ['--set-upstream']);

  await git.stash(['apply']);
};

newBranchFromMain();
