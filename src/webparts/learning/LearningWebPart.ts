import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'LearningWebPartStrings';
import { IMyListComponentProps } from './components/IMyListComponentProps';
import MyListComponent from './components/MyListComponent';

export interface ILearningWebPartProps {
  description: string;
  listName: string;
}

export default class LearningWebPart extends BaseClientSideWebPart<ILearningWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IMyListComponentProps> = React.createElement(
      MyListComponent,
      {
        context: this.context,
        listName: this.properties.listName || 'TestList'
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('listName', {
                  label: 'List Name'
                }),
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
