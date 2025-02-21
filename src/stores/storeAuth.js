import { defineStore } from 'pinia'
import { supabase } from 'src/config/supabase'
import { useShowErrorMessage } from 'src/use/useShowErrorMessage'
import { useRouter } from 'vue-router'
import { reactive } from 'vue'
export const useStoreAuth = defineStore('auth', () => {

  /*
    state
  */
 const userDetailsDefault={
  id:null,
    email:null,
 }
const userDetails=reactive(
  {
   ...userDetailsDefault
  }
)
 

  /*
    getters
  */

 

  /*
    actions
  */
 //creating new user
const registerUser=async({email,password})=>{

  let { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  if(error) useShowErrorMessage(error.message)
  if(data)console.log('data',data)
}
  //login user
  const loginUser=async({email,password})=>{

    
let { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
if(error) useShowErrorMessage(error.message)
  if(data)
    console.log('data',data)
  }

  const init=()=>{
    const router=useRouter()
     supabase.auth.onAuthStateChange((event, session) => {
//console.log(event, session)

 if (event === 'SIGNED_IN' || event ==='INITIAL_SESSION') {
 if (session !== null){
  userDetails.id=session.user.id,
  userDetails.email=session.user.email
  router.push('/')
 }
} else if (event === 'SIGNED_OUT') {
  router.replace('/auth')
}
})



  }
  const logoutUser = async () => {
    let { error } = await supabase.auth.signOut()
    if (error) useShowErrorMessage(error.message)
    // else console.log('User was signed out')
  }
  /*
    helpers
  */


  /*
    return
  */

  return {
    //state
    userDetails,
//actions
init,
registerUser,
loginUser,
logoutUser
    
  }

})