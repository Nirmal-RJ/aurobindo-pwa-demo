// Test-only navigation through the public sequential practice flow.
module.exports = async function advancePractice(page, bucket) {
  await page.evaluate(()=>{for(const key of Object.keys(ABConfig.timing))ABConfig.timing[key]=1;ABConfig.crash.duration=1;ABConfig.crash.titleDelay=1;});
  for(let n=1;n<bucket;n++){
    await page.locator('#screen[data-page="arrange"] .arrange-start').waitFor({state:'visible'});
    await page.locator('#outgoing').waitFor({state:'detached'});
    const ids=await page.locator('.step').evaluateAll(es=>es.map(e=>+e.dataset.id).sort((a,b)=>a-b));
    for(let i=0;i<ids.length;i++){const row=page.locator(`.step[data-id="${ids[i]}"]`);await row.focus();let at=await row.evaluate(e=>[...e.parentElement.children].indexOf(e));for(;at>i;at--)await page.keyboard.press('ArrowUp');}
    await page.getByRole('button',{name:'Start the Train',exact:true}).click();await page.getByRole('button',{name:'Next',exact:true}).click();
  }
};
