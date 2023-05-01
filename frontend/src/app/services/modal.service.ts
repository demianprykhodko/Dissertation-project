import { Injectable, ComponentFactoryResolver, Injector } from '@angular/core';
import { ModalComponent } from '../components/pages/modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector) { }

  openModal() {
    const modalFactory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
    const componentRef = modalFactory.create(this.injector);
    document.body.appendChild(componentRef.location.nativeElement);
  }

}
