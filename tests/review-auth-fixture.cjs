// Test-only responses. Never enable a mock-login fallback in production code.
module.exports=async function installReviewAuth(page,{role='ghost'}={}){
 const state={role};
 await page.route('**/review-api/**',route=>{
  const path=new URL(route.request().url()).pathname;
  if(path.endsWith('/logout'))return route.fulfill({status:204});
  const account={id:'fixture-'+state.role,employeeId:state.role==='ghost'?'100016':'100017',name:state.role==='ghost'?'Anand':'Review director',role:state.role,identityMethod:'employee-id-only'};
  return route.fulfill({status:200,json:{account,expiresAt:'2099-01-01T00:00:00Z',...(path.endsWith('/login')?{recoveryToken:'fixture-only-token'}:{})}});
 });
 return state;
};
