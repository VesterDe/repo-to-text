import ignore from 'ignore';

console.log(ignore().add(['node_modules/']).ignores('node_modules/'));
