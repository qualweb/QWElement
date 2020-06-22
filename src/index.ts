'use strict';

class QWElement {

  private element: Element;

  constructor(element: Element) {
    this.element = element;
  }

  public elementHasAttribute(attribute: string) {
    return this.element.getAttributeNames().includes(attribute);
  }

  public elementHasAttributes(): boolean {
    return this.element.getAttributeNames().length > 0;
  }

  public elementHasChild(childName: string): boolean {
    for (const child of this.element.children || []) {
      if (child.tagName.toLowerCase() === childName.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  public elementHasChildren(): boolean {
    return this.element.children.length > 0;
  }

  public elementHasParent(parent: string): boolean {
    const parentElement = this.element['parentElement'];
    return parentElement ? parentElement['tagName'].toLowerCase() === parent.toLowerCase() : false;
  }

  public getElementAttribute(attribute: string): string | null {
    return this.element.getAttribute(attribute);
  }

  public getElementAttributes(): any {
    const attributes = {};
    for (const attr of this.element.getAttributeNames() || []) {
      attributes[attr] = this.element.getAttribute(attr);
    }
    return attributes;
  }

  public getElementAttributesName(): Array<string> {
    return this.element.getAttributeNames();
  }

  public getElementChildren(): Array<QWElement> {
    const selector = this.getElementSelector();
    let treeSelector = this.getTreeSelector();
    let elements = this.element.querySelectorAll(selector + ' > *' + treeSelector);
    let qwList: Array<QWElement> = [];
    for (let element of elements) {
      qwList.push(new QWElement(element));
    }
    return qwList;
  }

  public getTreeSelector(): string {
    const attribute = this.getElementAttribute('shadowTree');
    let result = ':not([shadowTree])';
    if (attribute !== null) {
      result = `[shadowTree="${attribute}"]`
    }
    return result;
  }

  public getElementChildTextContent(childName: string): string | undefined {
    for (const child of this.element.children || []) {
      if (child.tagName.toLowerCase() === childName.toLowerCase()) {
        return child['textContent'] || undefined;
      }
    }
    return undefined;
  }

  public getElementHtmlCode(withText: boolean, fullElement: boolean): string {
    const clonedElem = <Element>this.element.cloneNode(true);
    if (fullElement) {
      return clonedElem.outerHTML;
    } else if (withText) {
      const text = clonedElem['text'];
      clonedElem.innerHTML = text !== undefined ? text : '';
      return clonedElem.outerHTML;
    } else {
      clonedElem.innerHTML = '';
      return clonedElem.outerHTML;
    }
  }

  public getElement(selector: string): QWElement | null {
    let element = this.element.querySelector(selector);

    return this.convertElementToQWElement(element);
  }

  private convertElementToQWElement(element: Element | null): QWElement | null {
    if (element)
      return new QWElement(element);
    else
      return null;
  }

  private convertElementsToQWElement(elements: NodeListOf<Element>): Array<QWElement> {
    let qwList: Array<QWElement> = [];
    for (let element of elements) {
      qwList.push(new QWElement(element));
    }
    return qwList;
  }

  public getElements(selector: string): Array<QWElement> {
    return this.convertElementsToQWElement(this.element.querySelectorAll(selector));
  }

  public getElementNextSibling(): QWElement | null {
    return this.convertElementToQWElement(this.element.nextElementSibling);
  }

  public getElementParent(): QWElement | null {
    return this.convertElementToQWElement(this.element.parentElement);
  }

  public getElementPreviousSibling(): QWElement | null {
    return this.convertElementToQWElement(this.element.previousElementSibling)
  }

  public getElementProperty(property: string): string {
    let propertyValue = this.element[property];
    return propertyValue === null ? "" : propertyValue;
  }

  public getElementSelector(): string {

    if (this.element.tagName.toLowerCase() === 'html') {
      return 'html';
    } else if (this.element.tagName.toLowerCase() === 'head') {
      return 'html > head';
    } else if (this.element.tagName.toLowerCase() === 'body') {
      return 'html > body';
    }

    let selector = 'html > ';
    let parents = new Array<string>();
    let parent = this.element.parentElement;

    while (parent && parent.tagName.toLowerCase() !== 'html') {
      parents.unshift(this.getSelfLocationInParent(parent));
      parent = parent['parentElement'];
    }

    selector += parents.join(' > ');
    selector += ' > ' + this.getSelfLocationInParent(this.element);

    return selector;
  }

  private getSelfLocationInParent(element: Element): string {
    let selector = '';

    if (element.tagName.toLowerCase() === 'body' || element.tagName.toLowerCase() === 'head') {
      return element.tagName.toLowerCase();
    }

    let sameEleCount = 0;

    let prev = element.previousElementSibling;
    while (prev) {
      if (prev.tagName.toLowerCase() === element.tagName.toLowerCase()) {
        sameEleCount++;
      }
      prev = prev.previousElementSibling;
    }

    selector += `${element.tagName.toLowerCase()}:nth-of-type(${sameEleCount + 1})`;

    return selector;
  }

  public getElementStyleProperty(property: string, pseudoStyle: string | null): string {
    const styles = getComputedStyle(this.element, pseudoStyle);
    return styles.getPropertyValue(property);
  }

  public getElementTagName(): string {
    return this.element['tagName'].toLowerCase();
  }

  public getElementText(): string {
    return this.element.textContent || '';
  }

  public getElementType(): string {
    return this.element.nodeType === 1 ? 'tag' : this.element.nodeType === 2 ? 'attribute' : this.element.nodeType === 3 ? 'text' : 'comment';
  }

  public getNumberOfSiblingsWithTheSameTag(): number {
    let aCount = 1;
    let nextSibling = this.element.nextElementSibling;

    while (nextSibling) {
      if (nextSibling.tagName.toLowerCase() === 'a') {
        aCount++;
      }
      nextSibling = nextSibling.nextElementSibling;
    }

    return aCount;
  }

  public setElementAttribute(attribute: string, value: string): void {
    this.element.setAttribute(attribute, value);
  }

  public concatANames(aNames: string[]): string {
    const children = this.element.childNodes;
    let result = '';
    let textContent: string | null;
    let i = 0;
    let counter = 0;
    for (const child of children || []) {
      textContent = child.textContent
      if (child.nodeType === 3 && !!textContent && textContent.trim() !== "") {
        result = result + (counter === 0 ? "" : " ") + textContent.trim();
        counter++;
      } else if (child.nodeType === 1) {
        result = result + (counter > 0 && !!aNames[i] ? " " : "") + aNames[i];
        i++;
      }
    }

    if (!result) {
      result = '';
    }

    return result;
  }

  public isOffScreen(): boolean {
    const scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );

    const scrollWidth = Math.max(
      document.body.scrollWidth, document.documentElement.scrollWidth,
      document.body.offsetWidth, document.documentElement.offsetWidth,
      document.body.clientWidth, document.documentElement.clientHeight
    );

    const bounding = this.element.getBoundingClientRect();
    const left = bounding.left;
    const right = bounding.right;
    const bottom = bounding.bottom;
    const top = bounding.top;

    const noParentScrollTop = this.noParentScrolled(bottom);

    return left > scrollWidth || right < 0 || bottom < 0 && noParentScrollTop || top > scrollHeight || right === 0 && left === 0;
  }

  public isElementHTMLElement(): boolean {
    return this.element instanceof HTMLElement;
  }

  public getContentFrame(): Document | null {
    let page: Document | null = null;

    if (this.getElementTagName() === "iframe") {
      const element = <HTMLIFrameElement>this.element;
      const contentWindow = element.contentWindow;

      if (contentWindow) {
        page = contentWindow.document
      }
    }

    return page;
  }

  public elementHasTextNode(): boolean {
    if (this.element.firstChild !== null) {
      return this.element.firstChild.nodeType === 3;
    } else {
      return false;
    }
  }

  private noParentScrolled(offset: number): boolean {
    let element = this.element.parentElement;
    while (element && element.nodeName.toLowerCase() !== 'html') {
      if (element.scrollTop) {
        offset += element.scrollTop;
        if (offset >= 0) {
          return false;
        }
      }
      element = element.parentElement;
    }
    return true;
  }

  public focusElement(): void {
    const htmlElement = <HTMLElement>this.element;
    htmlElement.focus();
  }

  public getBoundingBox(): any {
    return this.element.getBoundingClientRect();
  }
  public getShadowElement(selector: string): QWElement|null {
    let shadowRoot = this.element.shadowRoot;
    let element;
    if (shadowRoot)
      element = shadowRoot.querySelector(selector)
    return this.convertElementToQWElement(element);
  }
  public getShadowElements(selector: string): Array<QWElement> {
    let shadowRoot = this.element.shadowRoot;
    let elements;
    if (shadowRoot)
      elements = shadowRoot.querySelectorAll(selector)
    return this.convertElementsToQWElement(elements);
  }
}

export {
  QWElement
};
