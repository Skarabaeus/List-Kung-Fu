class CreateAssocTableListsTags < ActiveRecord::Migration
  def self.up
    create_table :lists_tags, :id => false do |t|
      t.integer :list_id
      t.integer :tag_id
    end
  end

  def self.down
    drop_table :lists_tags
  end
end
