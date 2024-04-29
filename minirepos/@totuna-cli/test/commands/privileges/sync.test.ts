import {expect, test} from '@oclif/test'

describe('privileges:sync', () => {
  test
  .stdout()
  .command(['privileges:sync'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['privileges:sync', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
