import { NgModule, Component, enableProdMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'devextreme/ui/html_editor/converters/markdown';
import prettier from 'prettier/standalone';
import parserHtml from 'prettier/parser-html';
import { DxHtmlEditorModule, DxHtmlEditorTypes } from 'devextreme-angular/ui/html-editor';
import { DxButtonGroupModule, DxButtonGroupTypes } from 'devextreme-angular/ui/button-group';
import { Service } from './app.service';

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

@Component({
  selector: 'demo-app',
  templateUrl: 'app/app.component.html',
  styleUrls: ['app/app.component.css'],
  providers: [Service],
})

export class AppComponent {
  valueContent: string;

  editorValueType: DxHtmlEditorTypes.MarkupType = 'html';

  constructor(service: Service) {
    this.valueContent = service.getMarkup();
  }

  onValueTypeChanged({ addedItems }: DxButtonGroupTypes.SelectionChangedEvent) {
    this.editorValueType = addedItems[0].text.toLowerCase();
  }

  prettierFormat(markup: string) {
    if (this.editorValueType === 'html') {
      return prettier.format(markup, {
        parser: 'html',
        plugins: [parserHtml],
      });
    }
    return markup;
  }
}

@NgModule({
  imports: [
    BrowserModule,
    DxHtmlEditorModule,
    DxButtonGroupModule,
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})

export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
