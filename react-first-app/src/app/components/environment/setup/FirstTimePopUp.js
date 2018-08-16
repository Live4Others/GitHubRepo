import React from 'react';
import {EnvironmentForm} from './EnvironmentForm';

import { FooterStateless } from "../../FooterStateless";

export class FirstTimePopUp extends React.Component {
    constructor(props) {
        super(props);
    
        this.state = { isOpen: false };
      }
    
      openPopup = () => {
        this.setState({
          isOpen: true
        });
      }
    
      closePopup = () => {
        this.setState({
          isOpen: false
        });
      }
    
      render() {
        return (
          <div>
            <EnvironmentForm onClose={this.closePopup}> </EnvironmentForm>
            <FooterStateless copyrightLink="http://live4others.com" />
          </div>
        );
      }
}
