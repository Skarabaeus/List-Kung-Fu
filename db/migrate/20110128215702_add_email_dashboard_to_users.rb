class AddEmailDashboardToUsers < ActiveRecord::Migration
  def self.up
    add_column :users, :email_dashboard, :boolean, :null => false, :default => false
  end

  def self.down
    drop_column :users, :email_dashboard
  end
end
