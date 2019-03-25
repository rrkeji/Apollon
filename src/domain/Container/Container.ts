import Element from './../Element';
import { UMLElement } from '../..';

abstract class Container extends Element {
  static features = { ...Element.features, droppable: true };
  ownedElements: string[] = [];

  render(children: Element[]): Element[] {
    return [this, ...children];
  }

  addElement(newElement: Element, currentElements: Element[]): Element[] {
    this.ownedElements.push(newElement.id);
    newElement.owner = this.id;
    return [this, ...currentElements, newElement];
  }

  removeElement(removedElement: string, currentElements: Element[]): Element[] {
    this.ownedElements = this.ownedElements.filter(id => id !== removedElement);
    const children = currentElements.filter(e => e.id !== removedElement);
    return [this, ...children];
  }

  resizeElement(children: Element[]): Element[] {
    return [this, ...children];
  }
}

export default Container;
