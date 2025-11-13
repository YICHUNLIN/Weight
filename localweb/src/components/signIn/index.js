
import { SignInPage} from '@toolpad/core/SignInPage';
import { GetTicket } from '../../action/auth';
import React, { useContext} from 'react';
import { useEffect } from 'react';
const providers = [
  { id: 'credentials', name: 'Jung`s ODS key' }
];


const SignIn = ({onSuccess}) => {
    return <SignInPage 
              signIn={(provider, formData) => {
                return new Promise((resolve) => {
                  GetTicket({account: formData.get('email'), password: formData.get('password')})
                      .then((d) => {
                          onSuccess(d)
                          resolve({success: "OK"})
                      }).catch(err => resolve({error: err.message}))
                });
              }} 
              providers={providers} 
              slotProps={
                { 
                    emailField: { autoFocus: false, label: "帳號", placeholder: "輸入你的名字"}, 
                    passwordField: { autoFocus: false, label: "密碼", placeholder: "輸入你的密碼"},
                    form: { noValidate: true} 
                }
            }/> 
}

export default SignIn