"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface LoanResult {
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
}

export function LoanCalculator() {
    const [amount, setAmount] = useState<string>("");
    const [term, setTerm] = useState<string>("");
    const [rate, setRate] = useState<string>("");
    const [result, setResult] = useState<LoanResult | null>(null);

    const calculateLoan = () => {
        const principal = parseFloat(amount);
        const months = parseFloat(term);
        const annualInterest = parseFloat(rate);

        if (isNaN(principal) || isNaN(months) || isNaN(annualInterest)) {
            setResult(null);
            return;
        }

        if (months <= 0 || principal <= 0) {
            setResult(null);
            return;
        }

        const monthlyRate = annualInterest / 100 / 12;

        let monthlyPayment = 0;
        if (monthlyRate === 0) {
            monthlyPayment = principal / months;
        } else {
            monthlyPayment =
                (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
                (Math.pow(1 + monthlyRate, months) - 1);
        }

        const totalPayment = monthlyPayment * months;
        const totalInterest = totalPayment - principal;

        setResult({
            monthlyPayment,
            totalPayment,
            totalInterest,
        });
    };

    // Calculate automatically when inputs change, or use a button if preferred.
    // For now, let's calculate on input change for dynamic feel? 
    // Actually, explicit button is often clearer for financial tools, but dynamic is "richer".
    // Let's use useEffect for dynamic updates if values are valid.
    useEffect(() => {
        if (amount && term && rate) {
            calculateLoan();
        } else {
            setResult(null);
        }
    }, [amount, term, rate]);


    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400">Loan Calculator</CardTitle>
                <CardDescription>Enter your loan details below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Loan Amount ($)
                    </label>
                    <Input
                        type="number"
                        placeholder="e.g. 5000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-lg"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            Term (Months)
                        </label>
                        <Input
                            type="number"
                            placeholder="12"
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            Interest Rate (%)
                        </label>
                        <Input
                            type="number"
                            placeholder="5.0"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                        />
                    </div>
                </div>

                {result && (
                    <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="text-center space-y-1">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Monthly Payment</p>
                            <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                                {formatCurrency(result.monthlyPayment)}
                            </p>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm">
                            <div>
                                <p className="text-zinc-500">Total Interest</p>
                                <p className="font-semibold">{formatCurrency(result.totalInterest)}</p>
                            </div>
                            <div>
                                <p className="text-zinc-500">Total Payment</p>
                                <p className="font-semibold">{formatCurrency(result.totalPayment)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg shadow-md hover:shadow-lg transition-all"
                    onClick={() => {
                        setAmount("");
                        setTerm("");
                        setRate("");
                        setResult(null);
                    }}
                    variant="outline"
                >
                    Reset
                </Button>
            </CardFooter>
        </Card>
    );
}
