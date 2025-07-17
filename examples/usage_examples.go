package main

import (
	"fmt"
	"log"
)


func ExampleUsage() {
	fmt.Println("=== EXEMPLOS DE USO DAS FUNCIONALIDADES ===")
	fmt.Println()

	fmt.Println("1. OBTER TEMPLATE DE IMPORTAÇÃO:")
	fmt.Println("Frontend chama: window.go.main.App.GetImportTemplate()")
	fmt.Println("Retorna:")
	fmt.Println("Nome,Preço,Categoria,Estoque,Descrição,URL da Imagem")
	fmt.Println("Produto Exemplo,29.99,Eletrônicos,10,Descrição do produto exemplo,https://exemplo.com/imagem.jpg")
	fmt.Println()

	fmt.Println("2. EXPORTAR TODOS OS PRODUTOS PARA CSV:")
	fmt.Println("Frontend chama: window.go.main.App.ExportProductsToCSV(true, [])")
	fmt.Println("Retorna string CSV que pode ser convertida em download")
	fmt.Println()

	fmt.Println("3. EXPORTAR PRODUTOS ESPECÍFICOS PARA XLSX:")
	fmt.Println("Frontend chama: window.go.main.App.ExportProductsToXLSX(false, [1, 2, 3])")
	fmt.Println("Retorna dados binários que podem ser convertidos em arquivo .xlsx")
	fmt.Println()

	fmt.Println("4. IMPORTAR PRODUTOS DE CSV:")
	fmt.Println("Frontend lê arquivo e chama: window.go.main.App.ImportProductsFromCSV(csvData)")
	fmt.Println("Retorna resultado com sucessos, erros e detalhes:")
	fmt.Println(`{
  "successCount": 2,
  "errorCount": 1,
  "errors": [
    {
      "row": 3,
      "field": "price",
      "message": "Preço deve ser um número válido",
      "value": "ABC"
    }
  ],
  "importedItems": [
    // produtos criados com sucesso
  ]
}`)
	fmt.Println()

	fmt.Println("5. FORMATO DE DADOS CSV ESPERADO:")
	fmt.Println(`Nome,Preço,Categoria,Estoque,Descrição,URL da Imagem
Smartphone Samsung,899.99,Eletrônicos,50,Smartphone com 128GB,https://exemplo.com/samsung.jpg
Notebook Dell,2499.90,Informática,10,Notebook Dell Inspiron 15,https://exemplo.com/dell.jpg
Cadeira Gamer,549.00,Móveis,25,Cadeira gamer ergonômica,
Mouse Sem Fio,89.90,Acessórios,100,Mouse óptico sem fio,`)
	fmt.Println()

	fmt.Println("=== BACKEND PRONTO PARA INTEGRAÇÃO ===")
}

func main() {
	log.Println("Demonstração das funcionalidades de importação e exportação")
	ExampleUsage()
}
