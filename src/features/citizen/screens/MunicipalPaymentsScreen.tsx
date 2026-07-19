import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useTheme } from "@/design-system/ThemeContext";
import { LumenIcon } from "@/design-system/icons/LumenIcon";
import { TextStyles, Spacing, Radius } from "@/design-system/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

// Mock Data
const PENDING_BILLS = [
  {
    id: "bill_1",
    type: "Water & Sanitation",
    amount: "₹850.50",
    dueDate: "Due in 5 days",
    icon: "water" as const,
    color: "#208AEF",
  },
  {
    id: "bill_2",
    type: "Property Tax",
    amount: "₹15,400.00",
    dueDate: "Due in 15 days",
    icon: "home" as const,
    color: "#7C3AED",
  },
];

export default function MunicipalPaymentsScreen() {
  const { colors, shadows, isDark } = useTheme();
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    if (!selectedBill) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        "Payment Successful",
        "Your municipal payment has been processed successfully. A receipt has been generated.",
        [{ text: "View Receipt", onPress: () => router.back() }]
      );
    }, 1500);
  };

  return (
    <View style={[s.root, { backgroundColor: colors.bgBase }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: colors.borderDefault }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <LumenIcon name="back" size="md" color={colors.textPrimary} />
        </Pressable>
        <Text style={[TextStyles.subtitle, { color: colors.textPrimary }]}>Municipal Payments</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <Text style={[TextStyles.title, { color: colors.textPrimary, marginBottom: Spacing[2] }]}>
          Pending Bills
        </Text>
        <Text style={[TextStyles.body, { color: colors.textSecondary, marginBottom: Spacing[6] }]}>
          Review and pay your outstanding municipal utility bills.
        </Text>

        <View style={s.billsList}>
          {PENDING_BILLS.map((bill) => {
            const isSelected = selectedBill === bill.id;
            return (
              <Pressable
                key={bill.id}
                onPress={() => setSelectedBill(bill.id)}
                style={[
                  s.billCard,
                  { backgroundColor: colors.bgSurface, ...shadows.md },
                  isSelected && { borderColor: colors.brand, borderWidth: 2 },
                  !isSelected && { borderColor: "transparent", borderWidth: 2 },
                ]}
              >
                <View style={[s.iconWrap, { backgroundColor: bill.color + "15" }]}>
                  <LumenIcon name={bill.icon} size="md" color={bill.color} />
                </View>
                <View style={s.billDetails}>
                  <Text style={[TextStyles.label, { color: colors.textPrimary }]}>{bill.type}</Text>
                  <Text style={[TextStyles.bodySmall, { color: colors.textTertiary, marginTop: 4 }]}>
                    {bill.dueDate}
                  </Text>
                </View>
                <Text style={[TextStyles.subtitle, { color: colors.textPrimary }]}>
                  {bill.amount}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[s.summaryCard, { backgroundColor: colors.bgSubtle }]}>
          <View style={s.summaryRow}>
            <Text style={[TextStyles.body, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[TextStyles.body, { color: colors.textPrimary }]}>
              {selectedBill === "bill_1" ? "₹850.50" : selectedBill === "bill_2" ? "₹15,400.00" : "₹0.00"}
            </Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={[TextStyles.body, { color: colors.textSecondary }]}>Processing Fee</Text>
            <Text style={[TextStyles.body, { color: colors.textPrimary }]}>₹0.00</Text>
          </View>
          <View style={[s.divider, { backgroundColor: colors.borderDefault }]} />
          <View style={s.summaryRow}>
            <Text style={[TextStyles.subtitle, { color: colors.textPrimary }]}>Total Amount</Text>
            <Text style={[TextStyles.title, { color: colors.textPrimary }]}>
              {selectedBill === "bill_1" ? "₹850.50" : selectedBill === "bill_2" ? "₹15,400.00" : "₹0.00"}
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            s.payBtn,
            (!selectedBill || isProcessing) && { opacity: 0.5 },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
          onPress={handlePay}
          disabled={!selectedBill || isProcessing}
        >
          <LinearGradient
            colors={["#208AEF", "#1D6FD1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.payBtnGradient}
          >
            <Text style={s.payBtnText}>
              {isProcessing ? "Processing..." : "Pay Securely"}
            </Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[10],
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
  },
  backBtn: { padding: Spacing[2], marginLeft: -Spacing[2] },
  content: { padding: Spacing[4], paddingBottom: Spacing[10] },
  billsList: { gap: Spacing[4], marginBottom: Spacing[6] },
  billCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing[4],
    borderRadius: Radius.lg,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing[4],
  },
  billDetails: { flex: 1 },
  summaryCard: {
    padding: Spacing[5],
    borderRadius: Radius.lg,
    marginBottom: Spacing[8],
    gap: Spacing[3],
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: { height: 1, marginVertical: Spacing[2] },
  payBtn: {
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  payBtnGradient: {
    paddingVertical: Spacing[4],
    alignItems: "center",
    justifyContent: "center",
  },
  payBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
