import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsers } from '@/hooks/useUsers';

interface UserSelectProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  allowEmpty?: boolean;
}

export function UserSelect({ value, onValueChange, placeholder = "Select a user", disabled = false, allowEmpty = true }: UserSelectProps) {
  const { users, loading } = useUsers();

  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === "none" && allowEmpty) {
      onValueChange(undefined);
    } else {
      onValueChange(selectedValue);
    }
  };

  return (
    <Select
      value={value || (allowEmpty ? "none" : undefined)}
      onValueChange={handleValueChange}
      disabled={disabled || loading}
    >
      <SelectTrigger>
        <SelectValue placeholder={loading ? "Loading users..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowEmpty && (
          <SelectItem value="none">No owner assigned</SelectItem>
        )}
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.name} ({user.email})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}