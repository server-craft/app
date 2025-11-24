package app

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSampleTest(t *testing.T) {
	assert.Equal(t, 2, 1+1, "Basic math should work")
}

func TestSliceContains(t *testing.T) {
	slice := []int{1, 2, 3}
	assert.Len(t, slice, 3)
	assert.Contains(t, slice, 2)
}
