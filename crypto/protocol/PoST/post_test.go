package PoST

import (
	"bytes"
	"crypto/rand"
	"math/big"
	"testing"
)

func TestProveAndVerify(t *testing.T) {
	// Test parameters
	const T uint = 28
	const N_BITS = 2048
	const k = 1
	const size = 64 // Size in MB

	// Generate random bytes for c
	c := make([]byte, 32)
	if _, err := rand.Read(c); err != nil {
		t.Fatalf("Failed to generate random bytes: %v", err)
	}

	// Generate random file of specified size
	file := make([]byte, size*1024)

	// Generate primes p and q
	p, q := Setup(N_BITS)
	n := new(big.Int).Mul(p, q)

	// Generate store values
	storeC, storeVs := store(c, file, p, q, int(T), k*720)

	// Generate proof values
	proveC, proveVs := prove(c, file, n, T, k*720)

	// Verify the proof
	if !bytes.Equal(storeC, proveC) {
		t.Errorf("Store and Prove results do not match: storeC = %x, proveC = %x", storeC, proveC)
	}

	if !bytes.Equal(storeVs, proveVs) {
		t.Errorf("Store and Prove VS results do not match: storeVs = %x, proveVs = %x", storeVs, proveVs)
	}

}
