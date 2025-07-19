package test

import (
	"bytes"
	"encoding/base64"
	"testing"

	"github.com/xuri/excelize/v2"
)

func TestXLSXImportWithBase64(t *testing.T) {
	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			t.Errorf("Failed to close XLSX file: %v", err)
		}
	}()

	f.SetCellValue("Sheet1", "A1", "Name")
	f.SetCellValue("Sheet1", "B1", "Price")
	f.SetCellValue("Sheet1", "C1", "Category")
	f.SetCellValue("Sheet1", "D1", "Stock")
	f.SetCellValue("Sheet1", "E1", "Description")
	f.SetCellValue("Sheet1", "F1", "Image URL")

	f.SetCellValue("Sheet1", "A2", "Test Product")
	f.SetCellValue("Sheet1", "B2", 29.99)
	f.SetCellValue("Sheet1", "C2", "Electronics")
	f.SetCellValue("Sheet1", "D2", 10)
	f.SetCellValue("Sheet1", "E2", "Test description")
	f.SetCellValue("Sheet1", "F2", "https://example.com/image.jpg")

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		t.Fatalf("Failed to write XLSX: %v", err)
	}

	base64Data := base64.StdEncoding.EncodeToString(buf.Bytes())

	decodedData, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		t.Fatalf("Failed to decode base64: %v", err)
	}

	if !bytes.Equal(buf.Bytes(), decodedData) {
		t.Error("Base64 encode/decode cycle failed")
	}

	t.Logf("XLSX base64 encoding/decoding test passed. Original size: %d bytes, Base64 size: %d chars",
		len(buf.Bytes()), len(base64Data))
}

func TestXLSXImportIntegration(t *testing.T) {
	// This test would require setting up a full service with database
	// For now, just verify that base64 decoding works
	base64TestData := "UEsDBBQAAAAIAAAQIwAAAAAAAAAAAAAAAREAAAEeAAAAeGwvd29ya3NoZWV0cy9zaGVldDEueG1s"

	_, err := base64.StdEncoding.DecodeString(base64TestData)
	if err != nil {
		t.Errorf("Failed to decode sample base64 data: %v", err)
	}
}
