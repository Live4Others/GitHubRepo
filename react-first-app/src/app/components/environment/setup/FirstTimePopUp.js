import React from 'react';
import {EnvironmentForm} from './EnvironmentForm';

import { FooterStateless } from "../../FooterStateless";

export class FirstTimePopUp extends React.Component {
    constructor(props) {
          super(props);
          this.indexComponent = props.indexComponent;
          this.state = { isOpen: true };
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
            <EnvironmentForm indexComponent={this.indexComponent} onClose={this.closePopup}> </EnvironmentForm>
            <FooterStateless copyrightLink="http://live4others.com" />
          </div>
        );
      }
}
