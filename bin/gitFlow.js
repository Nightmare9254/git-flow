import simpleGit from 'simple-git';
import inquirer from 'inquirer';
import autoCompleteInquirer from 'inquirer-autocomplete-prompt';
import {
  formatOnSpace,
  validateInput,
  validateSelect,
  checkIfBranchExists,
  obligatoryWords,
} from './helpers.js';
inquirer.registerPrompt('autocomplete', autoCompleteInquirer);

const pushToRemote = async (remote = 'origin', branch = '') => {
  const git = simpleGit();
  const { current } = await git.branch();
  // console.log(filesToCommit);
  // const commit = await git.commit(commitMessage, filesToCommit)
  await git.push(remote, branch.length > 1 ? branch : current);
  return current;
};

const pullFromRemote = async (remote = 'origin', branch = '') => {
  const git = simpleGit();
  const { current } = await git.branch();

  await git.pull(remote, branch.length > 1 ? branch : current);
};

const findBranches = async (userInput = '', allBranches) => {
  const filtered = allBranches.filter(branchName =>
    branchName.toLowerCase().includes(userInput) ? true : false
  );
  return filtered.length < 1 ? [`Create new branch: ${userInput}`] : filtered;
};

const checkIfFilesExists = async () => {
  const git = simpleGit();
  const { not_added, modified, created, deleted } = await git.status();
  const allFiles = [...not_added, ...modified, ...created, ...deleted];

  return {
    allFiles,
    filesExists: () => (allFiles.length >= 1 ? true : false),
  };
};

const commit = async () => {
  const git = simpleGit();
  const { allFiles } = await checkIfFilesExists();
  const conventionalCommit = obligatoryWords('Commit');

  const commitChanges = async () => {
    const { commitType, commitMessage, filesToCommit } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'filesToCommit',
        message: 'Choose files to commit',
        choices: allFiles,
        validate: validateSelect,
      },
      {
        type: 'list',
        name: 'commitType',
        message: 'Choose commit type',
        choices: conventionalCommit,
        default: conventionalCommit[0],
        validate: validateSelect,
      },
      {
        type: 'input',
        name: 'commitMessage',
        message: 'Add commit message',
        validate: validateInput,
      },
    ]);

    const formattedCommitMessage = formatOnSpace(
      commitType,
      commitMessage,
      ':',
      ' '
    );
    await git.add(filesToCommit);
    await git.commit(formattedCommitMessage);

    const a =
      allFiles.filter(file => !filesToCommit.includes(file)).length > 1
        ? true
        : false;

    return a;
  };

  return await commitChanges();
};

const move = async () => {
  const git = simpleGit();
  try {
    const { current, all } = await git.branch();

    const { filesExists } = await checkIfFilesExists();
    const apiStageType = process.env.npm_config_type; // --type=prod || test
    const apiBranch =
      apiStageType === 'prod' ? 'stage-api-prod' : 'stage-api-test';
    if (filesExists) {
      //Controls
      //tab - fill input
      //arrows - up/down to highlight form dropdown then tab to fill
      //enter - to accept
      const { stayOnCurrentBranch } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'stayOnCurrentBranch',
          message: `Changes will be pushed to: ${current}`,
        },
      ]);
      if (!stayOnCurrentBranch) {
        await git.stash();
        const { checkoutBranch } = await inquirer.prompt([
          {
            type: 'autocomplete',
            name: 'checkoutBranch',
            message: 'Choose branch',
            suggestOnly: true,
            searchText: 'Searching trough the remote ',
            emptyText: 'Nothing found!',
            validate: validateInput,
            source: (answers, input) => findBranches(input, all),
          },
        ]);

        const isNewBranch = checkIfBranchExists(checkoutBranch);

        if (isNewBranch !== true) {
          await git.checkoutBranch(checkoutBranch, 'origin/main');
          await git.push('origin', checkoutBranch, ['--set-upstream']);
        } else {
          await git.checkout(checkoutBranch);
        }
        await git.stash(['apply']);
      }

      let isMoreFiles = true;

      do {
        const commitStatus = await commit();
        isMoreFiles = commitStatus;
      } while (isMoreFiles);
      
      const previousBranch = await pushToRemote();
      
      await git.checkout(apiBranch); //stage-api-prod
      
      await pullFromRemote();

      const {conflicts,merges} =await git.merge([previousBranch, '--commit', '--edit']);
      console.log(conflicts)
      console.log(merges)

      await pushToRemote();
    }
  } catch (err) {
    console.log(err);
  }
  result('npm run testowa', (err, stdout) => {
    {
      console.log(err);
      console.log(stdout);
    }
  });
};

move();
