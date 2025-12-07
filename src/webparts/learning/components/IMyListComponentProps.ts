import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IMyListComponentProps {
  context: WebPartContext;
  listName: string;
}