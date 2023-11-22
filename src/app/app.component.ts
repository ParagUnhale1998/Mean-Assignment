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
  selectedCountry: string = '';
  allCountries!: any[];
  
  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.httpService.getData().subscribe((response) => {
      this.data = response;
      this.prepareChartData();
    });
  }

  private prepareChartData(): void {
    this.allCountries = Array.from(new Set(this.data.map((item: any) => item.country).filter((country: string) => country !== "")));
    this.allCountries.push('Select Country')
    this.selectedCountry = 'Select Country'
    const sectorIntensities :any= {};
  
    const allSectors = this.getUniqueSectors(this.data);
    allSectors.forEach((sector) => {
      const totalIntensity = this.calculateTotalIntensity(this.data, sector);
      sectorIntensities[sector] = totalIntensity;
    });
    
    const region = Array.from(new Set(this.data.map((item: any) => item.region).filter((country: string) => country !== "")));
    const intensity = this.data.map((item: any) => item.intensity)
    const intensityData = this.getChartDataByParameter('intensity');
    const relevanceData = this.getChartDataByParameter('relevance');
    const topic = Array.from(new Set(this.data.map((item: any) => item.topic)))
    const likelihood = Array.from(new Set(this.data.map((item: any) => item.likelihood)))
    const sector = Array.from(new Set(this.data.map((item: any) => item.sector).filter((sector: string) => sector !== "")));
    const pestle = Array.from(new Set(this.data.map((item: any) => item.pestle).filter((pestle: string) => pestle !== "")));
    const relevancedataArray = Object.entries(relevanceData).map(([country, value]) => ({ country, value }));
      // const relevance = this.data.map((item: any) => item.relevance)
      // const intensitydataArray = Object.entries(relevanceData).map(([country, value]) => ({ country, value }));
      // const relevances =Array.from(new Set( this.data.map((item: any) => item.country).filter((item: any) => item.relevance)))
    this.chartFunction('myChartBar','bar','All Countries Intensity Data',this.allCountries,intensityData)
    this.chartFunction('myChart1Pie','pie','All Countries Relevance Data',this.allCountries,relevancedataArray)
    this.chartFunction('myChart2bar','bar','All Countries Sector Intensity',sector,sectorIntensities)
    this.chartFunction('myChart3PolarArea','polarArea','All Countries likelihood Data',region,likelihood)
    this.chartFunction('myChart4Line','line','All Countries Topic+Intensity Data',topic,intensity)
    this.chartFunction('myChart5Bar','bar','All Countries Pestle+Intensity Data',pestle,intensity)
   
  }

 
  calculateTotalIntensity(data: any[], sector: string): number {
    const sectorItems = data.filter(item => item.sector === sector);
    const totalIntensity = sectorItems.reduce((sum, item) => sum + Number(item.intensity || 0), 0);
    return totalIntensity;
  }

  getUniqueSectors(data: any[]): string[] {
    return Array.from(new Set(data.map(item => item.sector)));
  }
  getItemsBySector(data: any[], selectedSector: string): any[] {
    return data.filter(item => item.sector === selectedSector);
  }
  

  getChartDataByParameter(parameter: string): { [key: string]: number[] } {
    const result: { [key: string]: any } = {};
  
    this.allCountries.forEach((countryName:any) => {
      const values = Array.from(new Set(
        this.data
          .filter((item: any) => item.country === countryName)
          .map((item: any) => item[parameter])
          
          ));
          // console.log(values)
          const numericValues = values.map((value) => Number(value)).filter((value) => !isNaN(value));
          const sum = numericValues.reduce((acc, value) => acc + value, 0);

          result[countryName] =sum
          
        });
        // console.log(result)
  
    return result;
  }

  updateChart(Country: any): void {
    this.selectedCountry = Country;
    const countryData = this.data.filter((item: any) => item.country === this.selectedCountry);
   console.log(countryData)
    const region =Array.from(new Set(this.mapCategoryData(countryData,'region')))
    // const pestle =Array.from(new Set(this.mapCategoryData(countryData,'pestle')))
    const likelihood = this.mapCategoryData(countryData,'likelihood')
    const topic = Array.from(new Set(this.mapCategoryData(countryData,'topic').filter((country: string) => country !== "")));
    const intensity = this.mapCategoryData(countryData,'intensity')
    const relevance = this.mapCategoryData(countryData,'relevance')
    const pestle = Array.from(new Set(this.mapCategoryData(countryData,'pestle').filter((country: string) => country !== "")));
    const chartIds = ['myChartBar', 'myChart1Pie', 'myChart2bar', 'myChart3PolarArea', 'myChart4Line', 'myChart5Bar'];

    chartIds.forEach((chartId) => {
      const existingChart = Chart.getChart(chartId);
      if (existingChart) {
        existingChart.destroy();
      }
    });
  
    this.chartFunction('myChartBar','bar','Region',region,likelihood)
    this.chartFunction('myChart1Pie','pie','Intensity Data',topic,intensity)
    this.chartFunction('myChart2bar','bar','Pestle',pestle,intensity)
    this.chartFunction('myChart3PolarArea','polarArea','Relevance Data',topic,relevance)
    this.chartFunction('myChart4Line','line','Pestle+Intensity Data',pestle,intensity)
    this.chartFunction('myChart5Bar','bar','Topic+Intensity Data',topic,intensity)
   
  }
  
 
  mapCategoryData(countryData: any, data: any) {
    return countryData.map((entry: any) => entry[data]);
  }

  chartFunction(chartname:any,type:any,labelName:any,labels:any,dataValue:any){
    const colors = this.getGradientColors(labels.length);
    new Chart(chartname, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: labelName,
          data: dataValue,
          borderWidth: 1,
          // backgroundColor:colors,
          backgroundImage:colors
          
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

    getColors(count: any): string[] {
    // Implement your logic to generate colors, for simplicity using random colors
    return Array.from({ length: count }, () => this.getRandomColor());
  }
  getGradientColors(count: number): string[] {
    const colors = [];
  
    for (let i = 0; i < count; i++) {
      const startColor = this.getRandomColor();
      const endColor = this.getRandomColor();
  
      // Create a linear gradient between startColor and endColor
      const gradient = this.createLinearGradient(startColor, endColor);
  
      colors.push(gradient);
    }
  //  console.log(colors)
    return colors;
  }
  
  createLinearGradient(startColor: string, endColor: string): string {
    return `linear-gradient(45deg, ${startColor}, ${endColor})`;
  }
  
  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

/*data: any;
  selectedCountry: string = 'India';
  allCountries:any;
  constructor(
    private httpService: HttpService,
  ) {}

  ngOnInit(): void {
    this.httpService.getData().subscribe((response) => {
      this.data = response;
      const allSectors = this.getUniqueSectors(this.data);

    
      const sectorIntensities :any= {};

      allSectors.forEach((sector) => {
        const totalIntensity = this.calculateTotalIntensity(this.data, sector);
        sectorIntensities[sector] = totalIntensity;
      });
      
      console.log('Sector Intensities: ', sectorIntensities);
      this.updateChart(this.selectedCountry)
      this.allCountries = Array.from(new Set(this.data.map((item: any) => item.country).filter((country: string) => country !== "")));
      console.log(this.allCountries)
      const region = Array.from(new Set(this.data.map((item: any) => item.region).filter((country: string) => country !== "")));
      const intensity = this.data.map((item: any) => item.intensity)
      console.log(intensity)
      const relevance = this.data.map((item: any) => item.relevance)
        const intensityData = this.getChartDataByParameter('intensity');
        const relevanceData = this.getChartDataByParameter('relevance');
        const intensitydataArray = Object.entries(relevanceData).map(([country, value]) => ({ country, value }));
        const relevancedataArray = Object.entries(relevanceData).map(([country, value]) => ({ country, value }));
      const relevances =Array.from(new Set( this.data.map((item: any) => item.country).filter((item: any) => item.relevance)))
      const topic = Array.from(new Set(this.data.map((item: any) => item.topic)))
      const likelihood = Array.from(new Set(this.data.map((item: any) => item.likelihood)))
      const sector = Array.from(new Set(this.data.map((item: any) => item.sector).filter((sector: string) => sector !== "")));
      const pestle = Array.from(new Set(this.data.map((item: any) => item.pestle).filter((pestle: string) => pestle !== "")));


      this.chartFunction('myChartBar','bar','All Countries Intensity Data',this.allCountries,intensityData)
      this.chartFunction('myChart1Pie','pie','All Countries Relevance Data',this.allCountries,relevancedataArray)
      this.chartFunction('myChart2bar','bar','All Countries Sector Intensity',sector,sectorIntensities)
      this.chartFunction('myChart3PolarArea','polarArea','All Countries likelihood Data',region,likelihood)
      // this.chartFunction('myChart4','doughnut','All Countries Topic',region,topic)
      this.chartFunction('myChart4Line','line','All Countries Topic+Intensity Data',topic,intensity)
      this.chartFunction('myChart5Bar','bar','All Countries Pestle+Intensity Data',pestle,intensity)
     
     
    });


  }*/