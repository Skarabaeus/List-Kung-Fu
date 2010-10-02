class AddUserIdToFilter < ActiveRecord::Migration
  def self.up
    add_column :filters, :user_id, :integer
  end

  def self.down
    remove_column :filters, :user_id
  end
end
