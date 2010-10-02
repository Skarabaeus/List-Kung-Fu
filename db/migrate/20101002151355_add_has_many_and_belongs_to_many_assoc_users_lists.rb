class AddHasManyAndBelongsToManyAssocUsersLists < ActiveRecord::Migration
  def self.up
    create_table :lists_users, :id => false do |t|
      t.integer :list_id
      t.integer :user_id
    end
  end

  def self.down
    drop_table :lists_users
  end
end
