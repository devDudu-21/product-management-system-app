package main

import (
	"fmt"
	"log"
)


func ExampleUsage() {
	fmt.Println("=== FUNCTIONALITY USAGE EXAMPLES ===")
	fmt.Println()

	fmt.Println("1. GET IMPORT TEMPLATE:")
	fmt.Println("Frontend calls: window.go.main.App.GetImportTemplate()")
	fmt.Println("Returns:")
	fmt.Println("Name,Price,Category,Stock,Description,Image URL")
	fmt.Println("Example Product,29.99,Electronics,10,Example product description,https://example.com/image.jpg")
	fmt.Println()

	fmt.Println("2. EXPORT ALL PRODUCTS TO CSV:")
	fmt.Println("Frontend calls: window.go.main.App.ExportProductsToCSV(true, [])")
	fmt.Println("Returns CSV string that can be converted to download")
	fmt.Println()

	fmt.Println("3. EXPORT SPECIFIC PRODUCTS TO XLSX:")
	fmt.Println("Frontend calls: window.go.main.App.ExportProductsToXLSX(false, [1, 2, 3])")
	fmt.Println("Returns binary data that can be converted to .xlsx file")
	fmt.Println()

	fmt.Println("4. IMPORT PRODUCTS FROM CSV:")
	fmt.Println("Frontend reads file and calls: window.go.main.App.ImportProductsFromCSV(csvData)")
	fmt.Println("Returns result with successes, errors and details:")
	fmt.Println(`{
  "successCount": 2,
  "errorCount": 1,
  "errors": [
    {
      "row": 3,
      "field": "price",
      "message": "Price must be a valid number",
      "value": "ABC"
    }
  ],
  "importedItems": [
    // successfully created products
  ]
}`)
	fmt.Println()

	fmt.Println("5. EXPECTED CSV DATA FORMAT:")
	fmt.Println(`Name,Price,Category,Stock,Description,Image URL
Samsung Smartphone,899.99,Electronics,50,Smartphone with 128GB,https://example.com/samsung.jpg
Dell Notebook,2499.90,Computers,10,Dell Inspiron 15 Notebook,https://example.com/dell.jpg
Gaming Chair,549.00,Furniture,25,Ergonomic gaming chair,
Wireless Mouse,89.90,Accessories,100,Optical wireless mouse,`)
	fmt.Println()

	fmt.Println("=== BACKEND READY FOR INTEGRATION ===")
}


func main() {
	log.Println("Demonstration of import and export functionalities")
	ExampleUsage()
}
