/**
 * Unit Tests for SalesByProductCustomerComponent
 *
 * These tests verify that the component:
 * 1. Initializes correctly and handles API responses
 * 2. Properly transforms API data into chart/table format
 * 3. Correctly toggles between chart and table views
 *
 * Note: Each test handles the initial HTTP request that occurs
 * during component initialization to prevent test failures.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SalesByProductCustomerComponent } from './sales-by-product-customer.component';
import { environment } from '../../../../environments/environment';

describe('SalesByProductCustomerComponent', () => {
  let component: SalesByProductCustomerComponent;
  let fixture: ComponentFixture<SalesByProductCustomerComponent>;
  let httpTestingController: HttpTestingController;

  /**
   * Test Setup
   *
   * Before each test:
   * 1. Configure TestBed with required component and HTTP testing module
   * 2. Create component instance and fixture
   * 3. Trigger initial detection cycle
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SalesByProductCustomerComponent,
        HttpClientTestingModule
      ]
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SalesByProductCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    // Handle the initial HTTP request
    const req = httpTestingController.expectOne(`${environment.apiBaseUrl}/reports/sales/sales-by-product-customer`);
    req.flush([]);
  });

  it('should fetch data from API and populate chartData/chartLabels', () => {
    const mockResponse = [
      { product: 'Prod A', customer: 'Cust 1', totalSales: 100, salesCount: 2 },
      { product: 'Prod B', customer: 'Cust 2', totalSales: 200, salesCount: 3 }
    ];

    // Expect one request per init
    const req = httpTestingController.expectOne(`${environment.apiBaseUrl}/reports/sales/sales-by-product-customer`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);

    // Allow subscription to process
    fixture.detectChanges();

    expect(component.data.length).toBe(2);
    expect(component.chartData).toEqual([100, 200]);
    expect(component.chartLabels).toEqual(['Prod A / Cust 1', 'Prod B / Cust 2']);
  });

  it('should toggle view between chart and table', () => {
    // Handle the initial HTTP request
    const req = httpTestingController.expectOne(`${environment.apiBaseUrl}/reports/sales/sales-by-product-customer`);
    req.flush([]);

    const initial = component.showChart;
    component.toggleView();
    expect(component.showChart).toBe(!initial);
    component.toggleView();
    expect(component.showChart).toBe(initial);
  });
});
