import { execSync } from 'node:child_process';
const sh = c => execSync(c, {encoding:'utf8'}).trim();
console.log(JSON.stringify({
  generatedAt:new Date().toISOString(),
  git:{
    sha:sh('git rev-parse HEAD'),
    branch:process.env.GITHUB_REF_NAME||sh('git rev-parse --abbrev-ref HEAD'),
    author:sh('git show -s --format=%an'),
    date:sh('git show -s --format=%cI')
  },
  toolchain:{ node:process.version, npm:sh('npm -v') }
}, null, 2));
