/**
 * SalesByProductCustomerComponent
 *
 * This component provides a detailed view of sales data grouped by product and customer.
 * It offers both chart and table visualizations with the following features:
 * - Date range filtering
 * - Product and customer name filters
 * - Toggle between bar chart and table views
 * - Sortable table columns
 * - Pagination for table view
 *
 * The data is automatically loaded when the component initializes and can be
 * refreshed using the filter controls.
 */

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ChartComponent } from '../../../shared/chart/chart.component';
import { TableComponent } from '../../../shared/table/table.component';

interface SalesData {
  product: string;
  customer: string;
  totalSales: number;
  salesCount: number;
}

interface TableSalesData {
  'Product': string;
  'Customer': string;
  'Total Sales': number;
  'Sales Count': number;
}

@Component({
  selector: 'app-sales-by-product-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartComponent, TableComponent],
  template: `
    <h1>Sales by Product and Customer</h1>
    <div class="container">
      <form class="form">
        <div class="form__group">
          <label class="label" for="startDate">Start Date</label>
          <input class="input" type="date" id="startDate" [(ngModel)]="startDate" name="startDate">
        </div>

        <div class="form__group">
          <label class="label" for="endDate">End Date</label>
          <input class="input" type="date" id="endDate" [(ngModel)]="endDate" name="endDate">
        </div>

        <div class="form__group">
          <label class="label" for="product">Product</label>
          <input class="input" type="text" id="product" [(ngModel)]="productFilter" name="product" placeholder="Optional product filter">
        </div>

        <div class="form__group">
          <label class="label" for="customer">Customer</label>
          <input class="input" type="text" id="customer" [(ngModel)]="customerFilter" name="customer" placeholder="Optional customer filter">
        </div>

        <div class="form__actions">
          <button class="button button--primary" type="button" (click)="fetchData()">Submit</button>
          <button class="button" type="button" (click)="toggleView()">
            {{ showChart ? 'Show Table' : 'Show Chart' }}
          </button>
        </div>
      </form>

      @if (loading) {
        <div class="spinner"></div>
      }

      @if (!loading) {
        @if (data.length > 0) {
          <div class="card chart-card">
            @if (showChart) {
              <app-chart
                [type]="'bar'"
                [label]="'Sales by Product/Customer'"
                [data]="chartData"
                [labels]="chartLabels">
              </app-chart>
            } @else {
              <app-table
                [title]="'Sales by Product / Customer'"
                [data]="data"
                [headers]="tableHeaders"
                [recordsPerPage]="10"
                [sortableColumns]="['Product','Customer','Total Sales']"
                [headerBackground]="'secondary'">
              </app-table>
            }
          </div>
        } @else {
          <div class="card">
            <p class="no-data">No sales data found for the selected criteria.</p>
          </div>
        }
      }
    </div>
  `,
  styles: `
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .form, .chart-card {
      width: 50%;
      margin: 20px 0;
      padding: 10px;
    }
    .form__group {
      margin-bottom: 1rem;
    }
    .form__actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .spinner {
      height: 48px;
      width: 48px;
      border-radius: 50%;
      border: 4px solid rgba(0,0,0,0.1);
      border-left-color: #20c997;
      animation: spin 1s linear infinite;
      margin: 12px auto;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .no-data {
      text-align: center;
      padding: 20px;
      color: #666;
    }
  `
})
export class SalesByProductCustomerComponent implements OnInit {
  // Raw data from API transformed for table
  data: TableSalesData[] = [];

  // Chart view data
  chartData: number[] = [];      // Sales amounts for bar chart
  chartLabels: string[] = [];    // Product/Customer labels for chart

  // Table view configuration
  tableHeaders: string[] = ['Product', 'Customer', 'Total Sales', 'Sales Count'];

  // View state
  showChart = true;    // Toggle between chart (true) and table (false) views
  loading = false;     // Loading indicator for data fetching

  // Filter controls
  startDate = '';         // Optional start date filter
  endDate = '';          // Optional end date filter
  productFilter = '';    // Optional product name filter
  customerFilter = '';   // Optional customer name filter

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchData();
  }

  /**
   * Fetches sales data from the API using the current filter settings
   *
   * This method:
   * 1. Shows a loading spinner
   * 2. Builds query parameters from active filters
   * 3. Makes the API request
   * 4. Transforms the response into chart/table format
   * 5. Updates the view with new data
   */
  fetchData(): void {
    this.loading = true;

    // Build query parameters from active filters
    const params: any = {};
    if (this.startDate) params.startDate = this.startDate;
    if (this.endDate) params.endDate = this.endDate;
    if (this.productFilter) params.product = this.productFilter;
    if (this.customerFilter) params.customer = this.customerFilter;

    const query = new URLSearchParams(params).toString();
    const url = `${environment.apiBaseUrl}/reports/sales/sales-by-product-customer${query ? '?' + query : ''}`;

    this.http.get<SalesData[]>(url).subscribe({
      next: (res) => {
        console.log('API Response:', res);
        const rawData: SalesData[] = res || [];
        console.log('Raw Data:', rawData);
        if (rawData.length > 0) {
          console.log('Sample item:', {
            product: rawData[0].product,
            customer: rawData[0].customer,
            totalSales: rawData[0].totalSales,
            salesCount: rawData[0].salesCount
          });
        }

        // Clear existing data
        this.data = [];
        this.chartData = [];
        this.chartLabels = [];

        if (rawData.length > 0) {
          // Transform data for chart view
          rawData.forEach((d: SalesData) => {
            // Format label
            const product = (d.product || '').trim();
            const customer = (d.customer || '').trim();
            const label = product && customer ? `${product} / ${customer}` : 'Total Sales';

            // Get sales value
            const totalSales = typeof d.totalSales === 'number' ? d.totalSales : 0;

            this.chartLabels.push(label);
            this.chartData.push(totalSales);
          });

          // Transform data for table
          this.data = rawData.map((item: SalesData): TableSalesData => ({
            'Product': item.product || '',
            'Customer': item.customer || '',
            'Total Sales': Number(item.totalSales || 0),
            'Sales Count': Number(item.salesCount || 0)
          }));
        }
      },
      error: (err) => {
        console.error('Error loading sales by product/customer', err);
        this.data = [];
        this.chartData = [];
        this.chartLabels = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Toggles between chart and table views
   *
   * Both views use the same underlying data but present it differently:
   * - Chart view: Bar chart showing sales amounts by product/customer
   * - Table view: Sortable, paginated table with detailed sales info
   */
  toggleView(): void {
    this.showChart = !this.showChart;
  }
}
