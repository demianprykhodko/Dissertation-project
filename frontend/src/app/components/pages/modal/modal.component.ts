import { Component, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {

  constructor(private viewContainerRef: ViewContainerRef) { }

  closeModal() {
    this.viewContainerRef.element.nativeElement.remove();
  }

}
