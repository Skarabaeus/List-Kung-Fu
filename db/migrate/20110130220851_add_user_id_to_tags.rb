class AddUserIdToTags < ActiveRecord::Migration
  def self.up
    add_column :tags, :user_id, :integer
  end

  def self.down
    drop_column :tags, :user_id
  end
end
