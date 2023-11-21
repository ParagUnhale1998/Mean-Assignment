import { Component } from '@angular/core';
import { ChartService } from './chart.service';
import { HttpService } from './http.service';
import { Chart } from 'chart.js/auto';
import { count } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  data: any;
  selectedCountry: string = 'India';
  allCountries:any;
  constructor(
    private httpService: HttpService,
    private chartService: ChartService
  ) {}

  ngOnInit(): void {
    this.httpService.getData().subscribe((response) => {
      this.data = response;
      this.updateChart(this.selectedCountry)
      this.allCountries = Array.from(new Set(this.data.map((item: any) => item.country).filter((country: string) => country !== "")));
      console.log(this.allCountries)
      const region = Array.from(new Set(this.data.map((item: any) => item.region).filter((country: string) => country !== "")));
      const intensity = this.data.map((item: any) => item.intensity)
      
      const relevance = this.data.map((item: any) => item.relevance)
      // this.allCountries.map((countryName:any) => {

      //   const relevances = Array.from(new Set(
      //     this.data
      //     .filter((item: any) => item.country === countryName)
      //     .map((item: any) => item.intensity)
      //     ));
      //     console.log(relevances)
      //   })
        const intensityData = this.getChartDataByParameter('intensity');
        const relevanceData = this.getChartDataByParameter('relevance');
        console.log(intensityData)
      const relevances =Array.from(new Set( this.data.map((item: any) => item.country).filter((item: any) => item.relevance)))
      const topic = Array.from(new Set(this.data.map((item: any) => item.topic)))
      const likelihood = Array.from(new Set(this.data.map((item: any) => item.likelihood)))
      // console.log(relevances)
      this.chartFunction('myChart','bar','Intensity',this.allCountries,intensityData)
      this.chartFunction('myChart1','polarArea','region',region,likelihood)
      this.chartFunction('myChart2','bar','Topic',topic,intensity)
      
    });
  }
 

  getChartDataByParameter(parameter: string): { [key: string]: number[] } {
    const result: { [key: string]: any } = {};
  
    this.allCountries.forEach((countryName:any) => {
      const values = Array.from(new Set(
        this.data
          .filter((item: any) => item.country === countryName)
          .map((item: any) => item[parameter])
          
          ));
          console.log(values)
          const numericValues = values.map((value) => Number(value)).filter((value) => !isNaN(value));
          const sum = numericValues.reduce((acc, value) => acc + value, 0);

          result[countryName] =sum
          
        });
        console.log(result)
  
    return result;
  }

  updateChart(Country: any): void {
    this.selectedCountry = Country;
    const countryData = this.data.filter((item: any) => item.country === this.selectedCountry);
   console.log(countryData)
    const region =Array.from(new Set(this.mapCategoryData(countryData,'region')))
    const likelihood = this.mapCategoryData(countryData,'likelihood')
    const topic = Array.from(new Set(this.mapCategoryData(countryData,'topic').filter((country: string) => country !== "")));
    const intensity = this.mapCategoryData(countryData,'intensity')
    const pestle = Array.from(new Set(this.mapCategoryData(countryData,'pestle').filter((country: string) => country !== "")));
    const existingChart = Chart.getChart('myChart');
    if (existingChart) {
      existingChart.destroy();
    }
    // this.chartFunction('myChart','pie','Region',region,likelihood)
    // this.chartFunction('myChart1','bar','Topic',topic,intensity)
    // this.chartFunction('myChart2','bar','Pestle',pestle,intensity)
    // this.chartFunction('myChart1','bar','Topic',topic,intensity)
  }
  
 
  mapCategoryData(countryData: any, data: any) {
    return countryData.map((entry: any) => entry[data]);
  }

  chartFunction(chartname:any,type:any,labelName:any,labels:any,dataValue:any){
    
    new Chart(chartname, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: labelName,
          data: dataValue,
          borderWidth: 1,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)', // Southern Asia color
            'rgba(54, 162, 235, 0.6)', // Europe color
            'rgba(24, 202, 235, 0.6)', // Europe color
            // Add more colors as needed
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(24, 202, 235, 0.6)',
            // Add more colors as needed
          ],
        }],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        responsive: true
      }
    });
   }

}
