import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { CustomerService } from '../services/customer.service';
import { AttHistoService } from '../services/att-histo.service';
import { CustomerSubscriptionService } from '../services/customer-subscription.service';
import { SubscriptionService } from '../services/subscription.service';

import { formatDate } from '../config/formatDate';

@Component({
    selector: 'app-customers-list',
    templateUrl: './customers-list.component.html',
    styleUrls: ['./customers-list.component.scss']
})
export class CustomersListComponent implements OnInit {
    customerList = [];
    constructor(private customerService: CustomerService, private customerSubscriptionService: CustomerSubscriptionService, private subscriptionService: SubscriptionService, private AttHService: AttHistoService, private router: Router) {
    }
    displayedColumns: string[] = ["name", "phone_number", "subs", "startDate", "endDate", "actions"];
    dataSource = new MatTableDataSource([]);
    checkboxes: any;
    attStatus = false;
    presence = false;

    delete(id: String): void {
        this.customerService.delete(id).subscribe(
            (response) => {
                window.location.reload();
            },
            (error) => {
                console.error(error);
            }
        );

    }
    checkBoxChange(id: any) {
        this.checkboxes = [];
        var inputElems = document.getElementsByTagName("input");
        for (var i = 0; i < inputElems.length; i++) {
            if (inputElems[i].type === "checkbox") {
                this.checkboxes.push(inputElems[i].checked)
            }
        }
        for (var i = 0; i <= this.checkboxes.length - 1; i++) {
            if (this.checkboxes[i] == true) {
                var today = new Date();
                var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                var CurrentDateTime = date + ' ' + time;
                this.addAttHisto(id, CurrentDateTime);
            }
        }
    }

    addAttHisto(id: any, date: any) {
        const objectToSubmit = { attTime: date, customerId: id };
        this.AttHService.add(objectToSubmit).subscribe(
            (response) => {
                window.location.reload();
            },
            (error) => {
                console.error(error);
            }
        );
    }
    ngOnInit() {
        // const d: Date = new Date();
        // let month: string | number = d.getMonth() + 1;
        // let day: string | number = d.getDate();

        // if (month < 10) {
        //     month = '0' + month;
        // }
        // if (day < 10) {
        //     day = '0' + day;
        // }
        // const date: string = `${d.getFullYear()}-${month}-${day}`;
        // this.customerService.getAll().subscribe((res: any) => {
        //     for (var i = 0; i < Object.keys(res).length; i++) {
        //         res[i]['presence'] = this.presence;
        //         this.dataSource = res;
        //     }
        //     this.AttHService.getAll().subscribe((result: any[]) => {
        //         for (var i = 0; i < Object.keys(result).length; i++) {
        //             const index = res.findIndex((x: any) => x.id === Number(result[i].customerId));
        //             var att = result[i].attTime.split("T", 1);
        //             var test = att.includes(date);
        //             if (test == true) {
        //                 this.attStatus = true;
        //                 this.presence = true;
        //             }
        //             if (index != -1) {
        //                 res[index]['attStatus'] = this.attStatus;
        //                 res[index]['presence'] = this.presence;
        //             }
        //             this.dataSource = res;
        //         }
        //         console.log(this.dataSource)
        //     },
        //         error => console.error(error)
        //     );
        // },
        //     error => console.error(error)
        // );
        this.customerService.getAll().subscribe((customerList) => {
            this.customerList = customerList;
            this.customerList.forEach((customer: any) => {
                this.customerSubscriptionService
                    .getById(customer["id"])
                    .subscribe((csubsIds) => {
                        customer["subsList"] = [];

                        console.log(csubsIds)

                        csubsIds.forEach((subscriptionId: any) => {
                            this.subscriptionService.getById(subscriptionId["subscriptionId"]).subscribe((sub) => {
                                customer["subsList"].push(sub["type"]);
                                customer["startDate"] = formatDate(subscriptionId["startDate"]);
                                customer["endDate"] = formatDate(subscriptionId["endDate"]);
                            });
                        });
                        this.dataSource.data = this.customerList;
                    });
            });
        });
    }
}
